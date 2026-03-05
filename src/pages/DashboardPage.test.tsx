import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi, type MockedFunction } from 'vitest';

import { DashboardPage } from './DashboardPage';
import { useAuth } from '../context/AuthContext';
import { productApi } from '../api/productApi';

// ---------------------------------------------------------------
// Mock react-router-dom navigate
// ---------------------------------------------------------------
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// ---------------------------------------------------------------
// Mock AuthContext
// ---------------------------------------------------------------
vi.mock('../context/AuthContext');
const mockUseAuth = useAuth as MockedFunction<typeof useAuth>;

// ---------------------------------------------------------------
// Mock productApi
// ---------------------------------------------------------------
vi.mock('../api/productApi', () => ({
    productApi: {
        getProducts: vi.fn(),
    },
}));
const mockGetProducts = productApi.getProducts as MockedFunction<typeof productApi.getProducts>;

const defaultAuthValue = {
    user: { id: 1, username: 'alice', email: 'alice@example.com', role: 'user' as const },
    token: 'mock-token',
    isLoading: false,
    isAuthenticated: true,
    authExpiredMessage: null,
    login: vi.fn(),
    logout: vi.fn(),
    checkAuth: vi.fn(),
    clearAuthExpiredMessage: vi.fn(),
};

function renderDashboardPage(authOverrides = {}) {
    mockUseAuth.mockReturnValue({ ...defaultAuthValue, ...authOverrides });
    return render(
        <MemoryRouter>
            <DashboardPage />
        </MemoryRouter>
    );
}

// ---------------------------------------------------------------
// Tests
// ---------------------------------------------------------------
describe('DashboardPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // 預設回傳空陣列，避免 unhandled promise
        mockGetProducts.mockResolvedValue([]);
    });

    describe('前端元素', () => {
        it('確認頁面渲染儀表板標題、歡迎卡片（含 avatar 與 role badge）、登出按鈕', async () => {
            renderDashboardPage();
            expect(screen.getByRole('heading', { name: '儀表板' })).toBeInTheDocument();
            expect(await screen.findByText('Welcome, alice 👋')).toBeInTheDocument();
            expect(screen.getByText('一般用戶')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '登出' })).toBeInTheDocument();
        });
    });

    describe('前端邏輯', () => {
        it('admin 使用者顯示「🛠️ 管理後台」連結，一般用戶不顯示', async () => {
            // admin 使用者
            const { unmount } = renderDashboardPage({ user: { ...defaultAuthValue.user, role: 'admin' as const } });
            expect(await screen.findByRole('link', { name: /管理後台/ })).toBeInTheDocument();

            // 清除前一次 render，避免 DOM 殘留影響斷言
            unmount();

            // 一般用戶
            renderDashboardPage({ user: { ...defaultAuthValue.user, role: 'user' as const } });
            expect(screen.queryByRole('link', { name: /管理後台/ })).not.toBeInTheDocument();
        });

        it('admin 角色顯示「管理員」徽章，user 角色顯示「一般用戶」徽章', async () => {
            // admin 角色
            renderDashboardPage({ user: { ...defaultAuthValue.user, role: 'admin' } });
            expect(await screen.findByText('管理員')).toBeInTheDocument();

            // user 角色
            renderDashboardPage({ user: { ...defaultAuthValue.user, role: 'user' } });
            expect(screen.getAllByText('一般用戶')[0]).toBeInTheDocument();
        });

        it('welcome card 的 avatar 正確顯示 username 的首字大寫', async () => {
            renderDashboardPage({ user: { ...defaultAuthValue.user, username: 'alice' } });
            expect(await screen.findByText('A')).toBeInTheDocument();
        });

        it('點擊登出按鈕呼叫 logout() 並導向至 /login', async () => {
            const user = userEvent.setup();
            const logoutMock = vi.fn();
            renderDashboardPage({ logout: logoutMock });

            await user.click(screen.getByRole('button', { name: '登出' }));

            expect(logoutMock).toHaveBeenCalledTimes(1);
            expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true, state: null });
        });
    });

    describe('Mock API', () => {
        it('掛載時呼叫 productApi.getProducts() 並顯示「載入商品中...」Loading 狀態', () => {
            // 永不 resolve，保持 loading 狀態
            mockGetProducts.mockReturnValue(new Promise(() => { /* pending */ }));
            renderDashboardPage();

            expect(screen.getByText('載入商品中...')).toBeInTheDocument();
            expect(mockGetProducts).toHaveBeenCalledTimes(1);
        });

        it('商品取得成功時正確顯示商品卡片（名稱、描述、價格）', async () => {
            mockGetProducts.mockResolvedValue([
                { id: 1, name: '測試商品', description: '商品描述', price: 100 },
            ]);
            renderDashboardPage();

            expect(await screen.findByText('測試商品')).toBeInTheDocument();
            expect(screen.getByText('商品描述')).toBeInTheDocument();
            expect(screen.getByText('NT$ 100')).toBeInTheDocument();
        });

        it('商品取得失敗（非 401）時顯示 API 錯誤訊息', async () => {
            const axiosError = {
                response: { status: 500, data: { message: '伺服器錯誤' } },
            };
            mockGetProducts.mockRejectedValue(axiosError);
            renderDashboardPage();

            expect(await screen.findByText('伺服器錯誤')).toBeInTheDocument();
        });

        it('401 錯誤時不設定 error 狀態（由 axios interceptor 處理）', async () => {
            const axiosError = {
                response: { status: 401, data: { message: 'Unauthorized' } },
            };
            mockGetProducts.mockRejectedValue(axiosError);
            renderDashboardPage();

            await waitFor(() => {
                expect(screen.queryByText('Unauthorized')).not.toBeInTheDocument();
                expect(screen.queryByText('無法載入商品資料')).not.toBeInTheDocument();
            });

            // 確認 loading 結束後 error 容器不存在
            expect(screen.queryByText(/⚠️/)).not.toBeInTheDocument();
        });
    });
});

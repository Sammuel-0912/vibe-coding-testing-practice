import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi, type MockedFunction } from 'vitest';

import { AdminPage } from './AdminPage';
import { useAuth } from '../context/AuthContext';
import { RoleBasedRoute } from '../components/RoleBasedRoute';

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

const defaultAuthValue = {
    user: { id: 1, username: 'admin', email: 'admin@example.com', role: 'admin' as const },
    token: 'mock-token',
    isLoading: false,
    isAuthenticated: true,
    authExpiredMessage: null,
    login: vi.fn(),
    logout: vi.fn(),
    checkAuth: vi.fn(),
    clearAuthExpiredMessage: vi.fn(),
};

function renderAdminPage(authOverrides = {}) {
    mockUseAuth.mockReturnValue({ ...defaultAuthValue, ...authOverrides });
    return render(
        <MemoryRouter>
            <AdminPage />
        </MemoryRouter>
    );
}

function renderWithRoleBasedRoute(authOverrides = {}) {
    mockUseAuth.mockReturnValue({ ...defaultAuthValue, ...authOverrides });
    return render(
        <MemoryRouter initialEntries={['/admin']}>
            <Routes>
                <Route
                    path="/admin"
                    element={
                        <RoleBasedRoute allowedRoles={['admin']}>
                            <AdminPage />
                        </RoleBasedRoute>
                    }
                />
                <Route path="/dashboard" element={<div>Dashboard Page</div>} />
            </Routes>
        </MemoryRouter>
    );
}

// ---------------------------------------------------------------
// Tests
// ---------------------------------------------------------------
describe('AdminPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('前端元素', () => {
        it('確認頁面正確渲染管理後台標題、返回連結、登出按鈕', () => {
            renderAdminPage();
            expect(screen.getByRole('heading', { name: /管理後台/ })).toBeInTheDocument();
            expect(screen.getByRole('link', { name: /← 返回/ })).toHaveAttribute('href', '/dashboard');
            expect(screen.getByRole('button', { name: '登出' })).toBeInTheDocument();
        });
    });

    describe('前端邏輯', () => {
        it('admin 角色顯示「管理員」徽章，user 角色顯示「一般用戶」徽章', () => {
            // admin 角色
            renderAdminPage({ user: { ...defaultAuthValue.user, role: 'admin' } });
            expect(screen.getByText('管理員')).toBeInTheDocument();

            // user 角色
            renderAdminPage({ user: { ...defaultAuthValue.user, role: 'user' } });
            expect(screen.getAllByText('一般用戶')[0]).toBeInTheDocument();
        });

        it('點擊登出按鈕呼叫 logout() 並導向至 /login', async () => {
            const user = userEvent.setup();
            const logoutMock = vi.fn();
            renderAdminPage({ logout: logoutMock });

            await user.click(screen.getByRole('button', { name: '登出' }));

            expect(logoutMock).toHaveBeenCalledTimes(1);
            expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true, state: null });
        });
    });

    describe('驗證權限', () => {
        it('RoleBasedRoute 在 isLoading 為 true 時顯示「驗證權限中...」Loading 畫面', () => {
            renderWithRoleBasedRoute({ isLoading: true });
            expect(screen.getByText('驗證權限中...')).toBeInTheDocument();
            expect(screen.queryByRole('heading', { name: /管理後台/ })).not.toBeInTheDocument();
        });

        it('非 admin 角色（user 角色）被 RoleBasedRoute 重定向至 /dashboard', () => {
            renderWithRoleBasedRoute({
                user: { ...defaultAuthValue.user, role: 'user' },
            });
            expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
            expect(screen.queryByRole('heading', { name: /管理後台/ })).not.toBeInTheDocument();
        });
    });
});

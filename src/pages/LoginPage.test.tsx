import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi, type MockedFunction } from 'vitest';

import { LoginPage } from './LoginPage';
import { useAuth } from '../context/AuthContext';

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
    user: null,
    token: null,
    isLoading: false,
    isAuthenticated: false,
    authExpiredMessage: null,
    login: vi.fn(),
    logout: vi.fn(),
    checkAuth: vi.fn(),
    clearAuthExpiredMessage: vi.fn(),
};

function renderLoginPage(authOverrides = {}) {
    mockUseAuth.mockReturnValue({ ...defaultAuthValue, ...authOverrides });
    return render(
        <MemoryRouter>
            <LoginPage />
        </MemoryRouter>
    );
}

// ---------------------------------------------------------------
// Tests
// ---------------------------------------------------------------
describe('LoginPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('前端元素', () => {
        it('確認頁面正確渲染登入表單元素', () => {
            renderLoginPage();
            expect(screen.getByLabelText('電子郵件')).toBeInTheDocument();
            expect(screen.getByLabelText('密碼')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '登入' })).toBeInTheDocument();
        });

        it('確認已登入狀態下掛載組件會導向至 /dashboard', async () => {
            renderLoginPage({ isAuthenticated: true });
            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
            });
        });
    });

    describe('前端邏輯', () => {
        it('驗證 Email 格式錯誤時會顯示錯誤提示', async () => {
            const user = userEvent.setup();
            renderLoginPage();

            await user.type(screen.getByLabelText('電子郵件'), 'invalid-email');
            await user.type(screen.getByLabelText('密碼'), 'password123');
            await user.click(screen.getByRole('button', { name: '登入' }));

            expect(await screen.findByText('請輸入有效的 Email 格式')).toBeInTheDocument();
        });

        it('驗證密碼長度不足或未包含英數時顯示錯誤提示', async () => {
            const user = userEvent.setup();

            // 密碼長度不足
            renderLoginPage();
            await user.type(screen.getByLabelText('電子郵件'), 'test@example.com');
            await user.type(screen.getByLabelText('密碼'), '123');
            await user.click(screen.getByRole('button', { name: '登入' }));

            expect(await screen.findByText('密碼必須至少 8 個字元')).toBeInTheDocument();

            // 未包含英數（純英文）
            vi.clearAllMocks();
            renderLoginPage();
            await user.clear(screen.getAllByLabelText('密碼')[1] ?? screen.getByLabelText('密碼'));
            const passwordInput = screen.getAllByLabelText('密碼');
            await user.type(passwordInput[passwordInput.length - 1], 'abcdefgh');
            await user.click(screen.getAllByRole('button', { name: '登入' })[0]);

            expect(await screen.findByText('密碼必須包含英文字母和數字')).toBeInTheDocument();
        });

        it('驗證送出表單且格式驗證通過時會出現 Loading 狀態', async () => {
            const user = userEvent.setup();
            const loginMock = vi.fn(() => new Promise<void>(() => { /* pending */ }));
            renderLoginPage({ login: loginMock });

            await user.type(screen.getByLabelText('電子郵件'), 'test@example.com');
            await user.type(screen.getByLabelText('密碼'), 'password123');
            await user.click(screen.getByRole('button', { name: '登入' }));

            expect(await screen.findByText('登入中...')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /登入中/ })).toBeDisabled();
        });

        it('驗證 AuthContext 中有 authExpiredMessage 時正確顯示在畫面上並清除', async () => {
            const clearAuthExpiredMessage = vi.fn();
            renderLoginPage({
                authExpiredMessage: '登入已過期',
                clearAuthExpiredMessage,
            });

            expect(await screen.findByText('登入已過期')).toBeInTheDocument();
            expect(clearAuthExpiredMessage).toHaveBeenCalledTimes(1);
        });
    });

    describe('Mock API', () => {
        it('驗證登入成功時呼叫 login api 並導向至 /dashboard', async () => {
            const user = userEvent.setup();
            const loginMock = vi.fn().mockResolvedValue(undefined);
            renderLoginPage({ login: loginMock });

            await user.type(screen.getByLabelText('電子郵件'), 'test@example.com');
            await user.type(screen.getByLabelText('密碼'), 'password123');
            await user.click(screen.getByRole('button', { name: '登入' }));

            await waitFor(() => {
                expect(loginMock).toHaveBeenCalledWith('test@example.com', 'password123');
                expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
            });
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('驗證登入失敗時會顯示紅色的 API 錯誤 banner', async () => {
            const user = userEvent.setup();
            const loginMock = vi.fn().mockRejectedValue({
                response: { data: { message: '密碼錯誤' } },
            });
            renderLoginPage({ login: loginMock });

            await user.type(screen.getByLabelText('電子郵件'), 'test@example.com');
            await user.type(screen.getByLabelText('密碼'), 'password123');
            await user.click(screen.getByRole('button', { name: '登入' }));

            expect(await screen.findByRole('alert')).toHaveTextContent('密碼錯誤');
        });
    });
});

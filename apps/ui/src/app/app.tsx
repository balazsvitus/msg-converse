import { CssBaseline, GlobalStyles, ThemeProvider, useMediaQuery } from '@mui/material';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { useLazyGetUserByIdQuery } from './api/users-api/users-api';
import ChannelComponent from './features/channels/components/ChannelComponent';
import ChannelPage from './features/channels/pages/ChannelPage';
import HomePage from './features/home/pages/HomePage';
import SignInPage from './features/login/pages/SignInPage';
import { clearCredentials, setCredentials } from './features/login/slices/auth-slice';
import SignUpPage from './features/register/pages/SignUpPage';
import SiderbarLayout from './layouts/SidebarLayout';
import NotFoundPage from './pages/NotFoundPage';
import { RootState, store } from './store/store';
import { DecodedPayload } from './types/login/DecodedPayload.types';
import { decodeToken, getScrollbar, getTheme } from './utils/utils';

export function App() {
    const theme = useSelector((state: RootState) => state.theme);
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

    const navigate = useNavigate();

    const [getUserById] = useLazyGetUserByIdQuery();
    const user = useSelector((state: RootState) => state.auth.user);
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token && !user) {
            const payload = decodeToken(token);
            if (payload) {
                const fetchUser = async () => {
                    try {
                        const user = await getUserById((payload as DecodedPayload).sub).unwrap();
                        store.dispatch(setCredentials({ user, accessToken: token }));
                    } catch (error) {
                        console.error('Failed to fetch user:', error);
                    }
                };

                fetchUser();
            } else {
                store.dispatch(clearCredentials());
            }
        }
    }, [getUserById, navigate, user]);

    return (
        <ThemeProvider theme={getTheme(theme, prefersDarkMode)}>
            <CssBaseline />
            <GlobalStyles styles={getScrollbar(theme, prefersDarkMode)} />
            <Routes>
                <Route element={<SiderbarLayout />} />
                <Route element={<SiderbarLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/channels">
                        <Route path="new" element={<ChannelPage />} />
                        <Route path="edit/:id" element={<ChannelPage />} />

                        <Route path=":id" element={<ChannelComponent />} />
                    </Route>
                </Route>
                <Route path="/login" element={<SignInPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </ThemeProvider>
    );
}

export default App;

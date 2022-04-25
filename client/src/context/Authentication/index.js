/*
     Esse contexto é responsalve pela authenticação do usuario. 
    -> Todas as informaçôes de de login ficam salvas aqui.
*/
import { createContext, useEffect, useState } from 'react'
import { useApi } from '../../hooks/useApi';
import { useToken } from '../../hooks/Token';
export const AuthContext = createContext({});

export const AuthContextProvider = function ({ children }) {

    const [userIsAuthenticated, setUserIsAuthenticated] = useState({ auth: false, email: null, name: null })

    const api = useApi();
    const storage = useToken();

    /** 
     * O refresh token na parte do cliente é feito no contexto de authenticação sem que o cliente perceba.
     * Toda vez que a pagina é recarregada o useEffeect é executado e nele a rota de refresh-token também e chamada.
     * **/

    useEffect(() => {
        RefreshToken()
    }, [])

    const RefreshToken = async function () {
        try {
            const { ok, data, token } = await api.refreshToken(storage.getRefreshToken(), storage.getToken())
            if (!ok) {
                alert('Usuario não authenticado');
                return false
            }
            setUserIsAuthenticated({ auth: true, email: data.email, name: data.email })
            storage.setToken(token)
        } catch (error) {
            console.log({ error })
        }
    }

    const Login = async function (email, password) {
        try {
            const { ok, token } = await api.login(email, password);
            if (!ok) throw new Error('Erro.')
            const { RefreshToken, Token, name } = token;
            setUserIsAuthenticated({ auth: true, email, name })
            storage.setToken(Token);
            storage.setRefreshToken(RefreshToken);
            return true;
        } catch (error) {
            alert(error.response.data.message || error)
            console.log({ error })
        }
    }

    return (
        <AuthContext.Provider value={{ Login, userIsAuthenticated }} >
            {children}
        </AuthContext.Provider>
    )
}

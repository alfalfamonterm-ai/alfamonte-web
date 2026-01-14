import { MercadoPagoConfig } from 'mercadopago';

let _mpClient: MercadoPagoConfig | null = null;

export const getMPClient = () => {
    if (!_mpClient) {
        _mpClient = new MercadoPagoConfig({
            accessToken: process.env.MP_ACCESS_TOKEN || 'test_access_token'
        });
    }
    return _mpClient;
};

export default getMPClient;

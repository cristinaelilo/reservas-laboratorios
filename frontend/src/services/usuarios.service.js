import api from './api';

export const usuariosService = {
    listar: async () => {
        const { data } = await api.get('/usuarios');
        return data;
    },

    crear: async (usuario) => {
        const { data } = await api.post('/usuarios', usuario);
        return data;
    },

    actualizar: async (id, datos) => {
        const { data } = await api.put(`/usuarios/${id}`, datos);
        return data;
    },

    cambiarEstado: async (id, activo) => {
        const { data } = await api.patch(`/usuarios/${id}/estado`, { activo });
        return data;
    }
};
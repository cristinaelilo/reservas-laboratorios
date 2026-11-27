import { useEffect, useState } from 'react';
import { usuariosService } from '../services/usuarios.service';
import './UsuariosPage.css';

const FORM_INICIAL = {
    nombre: '',
    correo: '',
    password: '',
    rol: 'ESTUDIANTE',
};

const ETIQUETA_ROL = {
    ADMIN: 'Administrador',
    DOCENTE: 'Docente',
    ESTUDIANTE: 'Estudiante',
    admin: 'Administrador',
    docente: 'Docente',
    estudiante: 'Estudiante',
};

function obtenerIniciales(nombre = '') {
    const partes = nombre.trim().split(/\s+/);
    if (partes.length === 0) return 'U';
    if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

export default function UsuariosPage() {
    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    const [busqueda, setBusqueda] = useState('');
    const [filtroRol, setFiltroRol] = useState('todos');

    const [modalAbierto, setModalAbierto] = useState(false);
    const [usuarioEditando, setUsuarioEditando] = useState(null);
    const [form, setForm] = useState(FORM_INICIAL);
    const [guardando, setGuardando] = useState(false);

    const cargarUsuarios = async () => {
        try {
            setCargando(true);
            setError('');
            const data = await usuariosService.listar();
            setUsuarios(data);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al cargar los usuarios');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const abrirModalCrear = () => {
        setUsuarioEditando(null);
        setForm(FORM_INICIAL);
        setModalAbierto(true);
    };

    const abrirModalEditar = (usuario) => {
        setUsuarioEditando(usuario);
        setForm({
            nombre: usuario.nombre,
            correo: usuario.correo,
            password: '',
            rol: usuario.rol,
        });
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setUsuarioEditando(null);
        setForm(FORM_INICIAL);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setGuardando(true);
            setError('');

            if (usuarioEditando) {
                const payload = {
                    nombre: form.nombre,
                    correo: form.correo,
                    rol: form.rol,
                };
                if (form.password.trim()) {
                    payload.password = form.password;
                }
                await usuariosService.actualizar(usuarioEditando.id, payload);
            } else {
                await usuariosService.crear(form);
            }

            cerrarModal();
            await cargarUsuarios();
        } catch (err) {
            setError(err.response?.data?.error || 'No se pudo guardar el usuario');
        } finally {
            setGuardando(false);
        }
    };

    const handleToggleEstado = async (usuario) => {
        const nuevoEstado = usuario.activo ? 0 : 1;
        try {
            setError('');
            await usuariosService.cambiarEstado(usuario.id, nuevoEstado);
            setUsuarios((prev) =>
                prev.map((u) => (u.id === usuario.id ? { ...u, activo: nuevoEstado } : u))
            );
        } catch (err) {
            setError(err.response?.data?.error || 'Error al cambiar el estado');
        }
    };

    const usuariosFiltrados = usuarios.filter((u) => {
        const coincideTexto =
            u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            u.correo.toLowerCase().includes(busqueda.toLowerCase());
        const coincideRol =
            filtroRol === 'todos' || u.rol?.toUpperCase() === filtroRol.toUpperCase();
        return coincideTexto && coincideRol;
    });

    return (
        <div className="usuarios-page">
            <div className="usuarios-top">
                <div>
                    <h1 className="usuarios-title">Usuarios</h1>
                    <p className="usuarios-subtitle">
                        Directorio de usuarios habilitados en el sistema.
                    </p>
                </div>
                <button className="btn-labu btn-labu-primary" onClick={abrirModalCrear}>
                    + Nuevo Usuario
                </button>
            </div>

            {error && <div className="alerta-error">{error}</div>}

            <div className="usuarios-toolbar">
                <input
                    type="text"
                    className="usuarios-search"
                    placeholder="Buscar por nombre o correo..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
                <select
                    className="usuarios-select"
                    value={filtroRol}
                    onChange={(e) => setFiltroRol(e.target.value)}
                >
                    <option value="todos">Todos los roles</option>
                    <option value="ADMIN">Administrador</option>
                    <option value="DOCENTE">Docente</option>
                    <option value="ESTUDIANTE">Estudiante</option>
                </select>
            </div>

            <div className="usuarios-card">
                {cargando ? (
                    <div className="estado-vacio">Cargando usuarios...</div>
                ) : usuariosFiltrados.length === 0 ? (
                    <div className="estado-vacio">No se encontraron usuarios.</div>
                ) : (
                    usuariosFiltrados.map((u) => (
                        <div
                            key={u.id}
                            className={`usuario-row ${u.activo ? '' : 'inactivo'}`}
                        >
                            <div className="usuario-info">
                                <div className="usuario-avatar">{obtenerIniciales(u.nombre)}</div>
                                <div>
                                    <div className="usuario-nombre">{u.nombre}</div>
                                    <div className="usuario-correo">{u.correo}</div>
                                </div>
                            </div>

                            <div className="usuario-meta">
                                <span className="pill-rol">
                                    {ETIQUETA_ROL[u.rol] || u.rol}
                                </span>
                                <span
                                    className={`pill-estado ${u.activo ? 'pill-activo' : 'pill-inactivo'
                                        }`}
                                >
                                    {u.activo ? 'Activo' : 'Inactivo'}
                                </span>
                                <button
                                    className="btn-labu btn-labu-ghost"
                                    onClick={() => abrirModalEditar(u)}
                                >
                                    Editar
                                </button>
                                <button
                                    className="btn-labu btn-labu-ghost"
                                    onClick={() => handleToggleEstado(u)}
                                >
                                    {u.activo ? 'Desactivar' : 'Activar'}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {modalAbierto && (
                <div className="modal-backdrop">
                    <div className="modal-card">
                        <h2>{usuarioEditando ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-grupo">
                                <label>Nombre completo</label>
                                <input
                                    type="text"
                                    required
                                    value={form.nombre}
                                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                />
                            </div>

                            <div className="form-grupo">
                                <label>Correo institucional</label>
                                <input
                                    type="email"
                                    required
                                    value={form.correo}
                                    onChange={(e) => setForm({ ...form, correo: e.target.value })}
                                />
                            </div>

                            <div className="form-grupo">
                                <label>
                                    Contraseña{' '}
                                    {usuarioEditando && '(dejar vacío para mantener la actual)'}
                                </label>
                                <input
                                    type="password"
                                    required={!usuarioEditando}
                                    value={form.password}
                                    onChange={(e) =>
                                        setForm({ ...form, password: e.target.value })
                                    }
                                />
                            </div>

                            <div className="form-grupo">
                                <label>Rol</label>
                                <select
                                    value={form.rol}
                                    onChange={(e) => setForm({ ...form, rol: e.target.value })}
                                >
                                    <option value="ESTUDIANTE">Estudiante</option>
                                    <option value="DOCENTE">Docente</option>
                                    <option value="ADMIN">Administrador</option>
                                </select>
                            </div>

                            <div className="modal-acciones">
                                <button
                                    type="button"
                                    className="btn-labu btn-labu-ghost"
                                    onClick={cerrarModal}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn-labu btn-labu-primary"
                                    disabled={guardando}
                                >
                                    {guardando ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
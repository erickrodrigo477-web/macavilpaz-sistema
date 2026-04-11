--
-- PostgreSQL database dump
--

\restrict xd1Z8l06S70AJ8gVdU0IrKcSbRXSgmBsRp9Ga5S2CltFTmcbIynWIHAYH5Jsgvq

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activos_fijos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.activos_fijos (
    id integer NOT NULL,
    nombre character varying(150) NOT NULL,
    descripcion text,
    codigo_inventario character varying(50),
    estado character varying(50),
    fecha_compra date,
    valor_inicial numeric(15,2) DEFAULT 0,
    valor_actual numeric(15,2) DEFAULT 0,
    depreciacion_acumulada numeric(15,2) DEFAULT 0,
    ubicacion character varying(255),
    valor_residual numeric(15,2) DEFAULT 0,
    vida_util integer DEFAULT 5
);


ALTER TABLE public.activos_fijos OWNER TO postgres;

--
-- Name: activos_fijos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.activos_fijos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.activos_fijos_id_seq OWNER TO postgres;

--
-- Name: activos_fijos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.activos_fijos_id_seq OWNED BY public.activos_fijos.id;


--
-- Name: almacen_suministros; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.almacen_suministros (
    almacen_id integer NOT NULL,
    suministro_id integer NOT NULL,
    stock integer DEFAULT 0
);


ALTER TABLE public.almacen_suministros OWNER TO postgres;

--
-- Name: almacenes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.almacenes (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    ubicacion character varying(255),
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.almacenes OWNER TO postgres;

--
-- Name: almacenes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.almacenes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.almacenes_id_seq OWNER TO postgres;

--
-- Name: almacenes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.almacenes_id_seq OWNED BY public.almacenes.id;


--
-- Name: asignaciones_activos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asignaciones_activos (
    id integer NOT NULL,
    activo_id integer,
    obra_id integer,
    usuario_id integer,
    fecha_asignacion date,
    fecha_devolucion date,
    estado character varying(50)
);


ALTER TABLE public.asignaciones_activos OWNER TO postgres;

--
-- Name: asignaciones_activos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.asignaciones_activos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.asignaciones_activos_id_seq OWNER TO postgres;

--
-- Name: asignaciones_activos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asignaciones_activos_id_seq OWNED BY public.asignaciones_activos.id;


--
-- Name: categorias_suministros; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categorias_suministros (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL
);


ALTER TABLE public.categorias_suministros OWNER TO postgres;

--
-- Name: categorias_suministros_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categorias_suministros_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categorias_suministros_id_seq OWNER TO postgres;

--
-- Name: categorias_suministros_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categorias_suministros_id_seq OWNED BY public.categorias_suministros.id;


--
-- Name: compras; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.compras (
    id integer NOT NULL,
    proveedor character varying(255),
    fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    total numeric(12,2) DEFAULT 0,
    usuario_id integer,
    estado character varying(50) DEFAULT 'Completado'::character varying
);


ALTER TABLE public.compras OWNER TO postgres;

--
-- Name: compras_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.compras_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.compras_id_seq OWNER TO postgres;

--
-- Name: compras_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.compras_id_seq OWNED BY public.compras.id;


--
-- Name: detalle_compras; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.detalle_compras (
    id integer NOT NULL,
    compra_id integer,
    suministro_id integer,
    cantidad integer NOT NULL,
    precio_unitario numeric(12,2) NOT NULL
);


ALTER TABLE public.detalle_compras OWNER TO postgres;

--
-- Name: detalle_compras_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.detalle_compras_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.detalle_compras_id_seq OWNER TO postgres;

--
-- Name: detalle_compras_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.detalle_compras_id_seq OWNED BY public.detalle_compras.id;


--
-- Name: detalle_solicitudes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.detalle_solicitudes (
    id integer NOT NULL,
    solicitud_id integer,
    suministro_id integer,
    cantidad integer,
    cantidad_solicitada integer,
    cantidad_disponible integer,
    faltante integer,
    cantidad_entregada integer DEFAULT 0,
    saldo_pendiente integer
);


ALTER TABLE public.detalle_solicitudes OWNER TO postgres;

--
-- Name: detalle_solicitudes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.detalle_solicitudes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.detalle_solicitudes_id_seq OWNER TO postgres;

--
-- Name: detalle_solicitudes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.detalle_solicitudes_id_seq OWNED BY public.detalle_solicitudes.id;


--
-- Name: inspecciones_activos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inspecciones_activos (
    id integer NOT NULL,
    activo_id integer,
    usuario_id integer,
    fecha_inspeccion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    nivel_vibracion integer,
    nivel_ruido integer,
    nivel_calor integer,
    desgaste_visible integer,
    comentarios text,
    falla_detectada boolean DEFAULT false
);


ALTER TABLE public.inspecciones_activos OWNER TO postgres;

--
-- Name: inspecciones_activos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.inspecciones_activos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inspecciones_activos_id_seq OWNER TO postgres;

--
-- Name: inspecciones_activos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.inspecciones_activos_id_seq OWNED BY public.inspecciones_activos.id;


--
-- Name: mantenimientos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mantenimientos (
    id integer NOT NULL,
    activo_id integer,
    fecha_mantenimiento timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    tipo_mantenimiento character varying(50),
    descripcion text,
    costo numeric(15,2) DEFAULT 0,
    tecnico character varying(150),
    proximo_mantenimiento date
);


ALTER TABLE public.mantenimientos OWNER TO postgres;

--
-- Name: mantenimientos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mantenimientos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mantenimientos_id_seq OWNER TO postgres;

--
-- Name: mantenimientos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mantenimientos_id_seq OWNED BY public.mantenimientos.id;


--
-- Name: movimientos_suministros; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.movimientos_suministros (
    id integer NOT NULL,
    suministro_id integer,
    tipo_movimiento character varying(20),
    cantidad integer,
    usuario_id integer,
    obra_id integer,
    fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.movimientos_suministros OWNER TO postgres;

--
-- Name: movimientos_suministros_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.movimientos_suministros_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.movimientos_suministros_id_seq OWNER TO postgres;

--
-- Name: movimientos_suministros_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.movimientos_suministros_id_seq OWNED BY public.movimientos_suministros.id;


--
-- Name: obras; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.obras (
    id integer NOT NULL,
    nombre character varying(150) NOT NULL,
    ubicacion character varying(150),
    fecha_inicio date,
    fecha_fin date,
    supervisor_id integer
);


ALTER TABLE public.obras OWNER TO postgres;

--
-- Name: obras_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.obras_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.obras_id_seq OWNER TO postgres;

--
-- Name: obras_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.obras_id_seq OWNED BY public.obras.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    nombre character varying(50) NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: solicitudes_activos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.solicitudes_activos (
    id integer NOT NULL,
    activo_id integer,
    obra_id integer,
    usuario_id integer,
    fecha_solicitud timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_inicio date NOT NULL,
    fecha_fin date NOT NULL,
    estado character varying(20) DEFAULT 'pendiente'::character varying,
    aprobado_por integer,
    fecha_aprobacion timestamp without time zone,
    comentario text,
    entregado_por integer,
    pdf_entrega character varying(255)
);


ALTER TABLE public.solicitudes_activos OWNER TO postgres;

--
-- Name: solicitudes_activos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.solicitudes_activos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.solicitudes_activos_id_seq OWNER TO postgres;

--
-- Name: solicitudes_activos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.solicitudes_activos_id_seq OWNED BY public.solicitudes_activos.id;


--
-- Name: solicitudes_materiales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.solicitudes_materiales (
    id integer NOT NULL,
    obra_id integer,
    usuario_id integer,
    fecha_solicitud date,
    estado character varying(50),
    aprobado_por integer,
    fecha_aprobacion timestamp without time zone,
    autorizado_por_contabilidad integer,
    fecha_autorizacion timestamp without time zone,
    entregado_por integer,
    pdf_entrega character varying(255),
    almacen_recogida_id integer
);


ALTER TABLE public.solicitudes_materiales OWNER TO postgres;

--
-- Name: solicitudes_materiales_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.solicitudes_materiales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.solicitudes_materiales_id_seq OWNER TO postgres;

--
-- Name: solicitudes_materiales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.solicitudes_materiales_id_seq OWNED BY public.solicitudes_materiales.id;


--
-- Name: suministros; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.suministros (
    id integer NOT NULL,
    nombre character varying(150) NOT NULL,
    descripcion text,
    unidad character varying(20),
    stock integer DEFAULT 0,
    categoria_id integer,
    precio_unitario numeric(10,2) DEFAULT 0.00
);


ALTER TABLE public.suministros OWNER TO postgres;

--
-- Name: suministros_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.suministros_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.suministros_id_seq OWNER TO postgres;

--
-- Name: suministros_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.suministros_id_seq OWNED BY public.suministros.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    rol_id integer,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: activos_fijos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activos_fijos ALTER COLUMN id SET DEFAULT nextval('public.activos_fijos_id_seq'::regclass);


--
-- Name: almacenes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.almacenes ALTER COLUMN id SET DEFAULT nextval('public.almacenes_id_seq'::regclass);


--
-- Name: asignaciones_activos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asignaciones_activos ALTER COLUMN id SET DEFAULT nextval('public.asignaciones_activos_id_seq'::regclass);


--
-- Name: categorias_suministros id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias_suministros ALTER COLUMN id SET DEFAULT nextval('public.categorias_suministros_id_seq'::regclass);


--
-- Name: compras id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compras ALTER COLUMN id SET DEFAULT nextval('public.compras_id_seq'::regclass);


--
-- Name: detalle_compras id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_compras ALTER COLUMN id SET DEFAULT nextval('public.detalle_compras_id_seq'::regclass);


--
-- Name: detalle_solicitudes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_solicitudes ALTER COLUMN id SET DEFAULT nextval('public.detalle_solicitudes_id_seq'::regclass);


--
-- Name: inspecciones_activos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inspecciones_activos ALTER COLUMN id SET DEFAULT nextval('public.inspecciones_activos_id_seq'::regclass);


--
-- Name: mantenimientos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mantenimientos ALTER COLUMN id SET DEFAULT nextval('public.mantenimientos_id_seq'::regclass);


--
-- Name: movimientos_suministros id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_suministros ALTER COLUMN id SET DEFAULT nextval('public.movimientos_suministros_id_seq'::regclass);


--
-- Name: obras id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.obras ALTER COLUMN id SET DEFAULT nextval('public.obras_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: solicitudes_activos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes_activos ALTER COLUMN id SET DEFAULT nextval('public.solicitudes_activos_id_seq'::regclass);


--
-- Name: solicitudes_materiales id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes_materiales ALTER COLUMN id SET DEFAULT nextval('public.solicitudes_materiales_id_seq'::regclass);


--
-- Name: suministros id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suministros ALTER COLUMN id SET DEFAULT nextval('public.suministros_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Data for Name: activos_fijos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.activos_fijos (id, nombre, descripcion, codigo_inventario, estado, fecha_compra, valor_inicial, valor_actual, depreciacion_acumulada, ubicacion, valor_residual, vida_util) FROM stdin;
1	Excavadora Hidráulica CAT 320 GC	Excavadora de 20 toneladas con motor C4.4, ideal para movimiento de tierras pesado.	EXC-001	operativo	2021-05-15	185000.00	111397.11	73602.89	Obra Viaducto Central	35000.00	10
2	Volqueta Mercedes-Benz Arocs 3345	Camión volquete 6x4, capacidad 16m3, motor de 450 HP.	VOL-002	operativo	2022-03-10	142000.00	83742.55	58257.45	Obra San José	28000.00	8
3	Motoniveladora Caterpillar 140 GC	Motoniveladora para nivelación de precisión y mantenimiento de caminos.	MOT-001	asignado	2020-11-20	210000.00	134557.91	75442.09	Tramo Carretero Sur	42000.00	12
4	Cargador Frontal Komatsu WA380-6	Cargador de ruedas de alto rendimiento para canteras y construcción.	CRG-001	operativo	2019-06-25	165000.00	73254.32	91745.68	Cantera Los Andes	30000.00	10
5	Generador Eléctrico Perkins 150kVA	Grupo electrógeno insonorizado para suministro de energía en sitio.	GEN-003	operativo	2023-01-12	24500.00	20173.35	4326.65	Almacén Central	4500.00	15
6	Mezcladora de Hormigón Autopropulsada Fiori DB X35	Mezcladora todoterreno con capacidad de 3.5m3 por ciclo.	MEZ-002	mantenimiento	2022-08-05	85000.00	52773.40	32226.60	Taller Mecánico	15000.00	8
7	Camioneta Toyota Hilux 4x4	Vehículo de supervisión y transporte de personal en obra.	VHL-001	asignado	2023-05-30	42000.00	24797.04	17202.96	Obra San José	12000.00	5
8	Estación Total Leica FlexLine TS07	Equipo de alta precisión para levantamientos topográficos.	TOP-001	operativo	2024-02-15	12500.00	7979.58	4520.42	Oficina Técnica	2000.00	5
9	Compactadora de Rodillo Liso Dynapac CA250	Rodillo vibratorio para compactación de suelos y bases.	CMP-001	operativo	2021-09-18	95000.00	59873.45	35126.55	Obra Viaducto Central	18000.00	10
10	Estructura de Andamios Multidireccionales (Lote 500m2)	Sistema de andamiaje certificado para trabajos en altura.	AND-001	operativo	2023-11-02	18000.00	15397.27	2602.73	Almacén Norte	2000.00	15
\.


--
-- Data for Name: almacen_suministros; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.almacen_suministros (almacen_id, suministro_id, stock) FROM stdin;
\.


--
-- Data for Name: almacenes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.almacenes (id, nombre, ubicacion, fecha_creacion) FROM stdin;
2	Almacén Norte	Zona Norte	2026-03-19 17:10:09.714465
4	Almacen sur	miraflores	2026-03-19 18:22:33.334818
1	Almacen Central	Oficina Principal	2026-03-19 16:45:45.388069
\.


--
-- Data for Name: asignaciones_activos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asignaciones_activos (id, activo_id, obra_id, usuario_id, fecha_asignacion, fecha_devolucion, estado) FROM stdin;
1	1	1	1	2023-01-01	2023-06-30	Finalizado
2	1	1	1	2023-08-15	2024-02-10	Finalizado
3	1	1	1	2024-03-01	\N	Activo
4	2	1	1	2023-05-10	2023-12-20	Finalizado
5	2	1	1	2024-01-15	\N	Activo
6	4	1	1	2022-01-01	2022-12-31	Finalizado
7	4	1	1	2023-02-15	2023-11-15	Finalizado
8	7	1	1	2023-07-01	\N	Activo
\.


--
-- Data for Name: categorias_suministros; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categorias_suministros (id, nombre) FROM stdin;
1	Materiales de Construcción
2	Ferretería y Tornillería
3	Herramientas Manuales
4	Equipo de Protección Personal (EPP)
5	Instalaciones Eléctricas
6	Plomería y Fontanería
7	Repuestos para Maquinaria
\.


--
-- Data for Name: compras; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.compras (id, proveedor, fecha, total, usuario_id, estado) FROM stdin;
1	Ferretería Central	2026-03-19 02:08:18.796641	1000.00	20	Completado
2	semento patito	2026-03-19 02:10:10.485376	2500.00	20	Completado
3	a	2026-03-19 02:11:42.838047	2500.00	20	Completado
4	Ferretería Central	2026-03-19 02:16:40.306419	1000.00	20	Completado
\.


--
-- Data for Name: detalle_compras; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.detalle_compras (id, compra_id, suministro_id, cantidad, precio_unitario) FROM stdin;
\.


--
-- Data for Name: detalle_solicitudes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.detalle_solicitudes (id, solicitud_id, suministro_id, cantidad, cantidad_solicitada, cantidad_disponible, faltante, cantidad_entregada, saldo_pendiente) FROM stdin;
\.


--
-- Data for Name: inspecciones_activos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inspecciones_activos (id, activo_id, usuario_id, fecha_inspeccion, nivel_vibracion, nivel_ruido, nivel_calor, desgaste_visible, comentarios, falla_detectada) FROM stdin;
\.


--
-- Data for Name: mantenimientos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mantenimientos (id, activo_id, fecha_mantenimiento, tipo_mantenimiento, descripcion, costo, tecnico, proximo_mantenimiento) FROM stdin;
1	1	2023-03-15 00:00:00	Preventivo	Cambio de aceite y filtros	450.00	Técnico Externo	\N
2	1	2023-11-20 00:00:00	Correctivo	Reparación de manguera hidráulica rota	1200.00	Técnico Externo	\N
3	1	2024-01-10 00:00:00	Correctivo	Fallo en motor de arranque	850.00	Técnico Externo	\N
4	1	2024-03-25 00:00:00	Correctivo	Pérdida de presión en bomba principal	3200.00	Técnico Externo	\N
5	2	2023-06-15 00:00:00	Preventivo	Mantenimiento periodico	300.00	Técnico Externo	\N
6	2	2024-01-05 00:00:00	Preventivo	Revision de frenos y suspensión	600.00	Técnico Externo	\N
7	4	2023-05-10 00:00:00	Preventivo	Cambio de neumáticos delanteros	2500.00	Técnico Externo	\N
8	5	2023-10-15 00:00:00	Preventivo	Limpieza de inyectores	200.00	Técnico Externo	\N
\.


--
-- Data for Name: movimientos_suministros; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.movimientos_suministros (id, suministro_id, tipo_movimiento, cantidad, usuario_id, obra_id, fecha) FROM stdin;
\.


--
-- Data for Name: obras; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.obras (id, nombre, ubicacion, fecha_inicio, fecha_fin, supervisor_id) FROM stdin;
1	Edificio Central	La Paz	2026-01-01	2026-12-31	\N
2	Puente Rio Seco	El Alto	2026-02-01	2026-08-31	3
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, nombre) FROM stdin;
1	Administrador
3	Supervisor de Obra
16	Técnico
17	Contabilidad
2	Almacén
\.


--
-- Data for Name: solicitudes_activos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.solicitudes_activos (id, activo_id, obra_id, usuario_id, fecha_solicitud, fecha_inicio, fecha_fin, estado, aprobado_por, fecha_aprobacion, comentario, entregado_por, pdf_entrega) FROM stdin;
\.


--
-- Data for Name: solicitudes_materiales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.solicitudes_materiales (id, obra_id, usuario_id, fecha_solicitud, estado, aprobado_por, fecha_aprobacion, autorizado_por_contabilidad, fecha_autorizacion, entregado_por, pdf_entrega, almacen_recogida_id) FROM stdin;
\.


--
-- Data for Name: suministros; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.suministros (id, nombre, descripcion, unidad, stock, categoria_id, precio_unitario) FROM stdin;
1	Cemento Portland IP-30	Bolsa de 50kg, alta resistencia inicial.	Bolsa	500	1	55.50
2	Fierro Corrugado 12mm	Barra de 12 metros, Grado 60.	Barra	120	1	88.00
3	Arena Fina Tamizada	Para revoques y acabados finos.	m3	15	1	180.00
4	Gravilla 3/4	Piedra chancada para concreto estructural.	m3	20	1	210.00
5	Ladrillo de 6 Huecos	Para muros divisorios, 24x12x18cm.	Millar	5	1	1250.00
6	Clavo para Madera 2 1/2"	Caja de 20kg, acero al carbono.	Caja	10	2	145.00
7	Alambre de Amarre #16	Rollo de 50kg, recocido.	Rollo	8	2	320.00
8	Pala Cuadrada Tramontina	Mango de madera de alta resistencia.	Unidad	25	3	115.00
9	Carretilla Reforzada 80L	Rueda neumática, balde de chapa 1.2mm.	Unidad	12	3	450.00
10	Martillo de Uña 20oz	Mango de fibra de vidrio anti-vibración.	Unidad	15	3	95.00
11	Casco de Seguridad MSA V-Gard	Color blanco, con suspensión de 4 puntos.	Unidad	60	4	75.00
12	Botas de Seguridad con Punta de Acero	Tallas 38-44, cuero hidrófugo.	Par	45	4	280.00
13	Guantes de Nitrilo Revestidos	Paquete de 12 pares, para manejo de materiales.	Paquete	20	4	110.00
14	Chaleco Reflectivo Clase 2	Alta visibilidad, color naranja fluor.	Unidad	50	4	35.00
15	Cable Eléctrico #12 AWG	Rollo de 100m, cobre THHN sólido.	Rollo	15	5	480.00
16	Tubo Conduit 3/4"	Tira de 3m, PVC pesado.	Tira	100	5	22.00
17	Filtro de Aceite para Excavadora CAT 320	Código original 1R-0739.	Unidad	6	7	245.00
18	Aceite Hidráulico SAE 10W	Balde de 20 litros, alta viscosidad.	Balde	10	7	680.00
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id, nombre, email, password, rol_id, creado_en) FROM stdin;
1	Erick Quispe	erick@macavilpaz.com	$2b$10$9BHYkTC33e9OnGpFya6sNuuQMoULIidu3O10ADXUgUqHdRHmh3Zje	1	2026-03-15 19:12:06.272186
2	Carlos Pérez	carlos@macavilpaz.com	$2b$10$9BHYkTC33e9OnGpFya6sNuuQMoULIidu3O10ADXUgUqHdRHmh3Zje	2	2026-03-15 19:12:06.272186
3	Juan Torres	ana@macavilpaz.com	$2b$10$9BHYkTC33e9OnGpFya6sNuuQMoULIidu3O10ADXUgUqHdRHmh3Zje	3	2026-03-15 19:12:06.272186
19	Test Tecnico	tecnico@test.com	$2b$10$9BHYkTC33e9OnGpFya6sNuuQMoULIidu3O10ADXUgUqHdRHmh3Zje	16	2026-03-17 15:16:36.298206
20	Maria Conta	maria@macavilpaz.com	123456	17	2026-03-19 02:05:32.55733
\.


--
-- Name: activos_fijos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.activos_fijos_id_seq', 10, true);


--
-- Name: almacenes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.almacenes_id_seq', 4, true);


--
-- Name: asignaciones_activos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asignaciones_activos_id_seq', 8, true);


--
-- Name: categorias_suministros_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categorias_suministros_id_seq', 7, true);


--
-- Name: compras_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.compras_id_seq', 4, true);


--
-- Name: detalle_compras_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.detalle_compras_id_seq', 1, false);


--
-- Name: detalle_solicitudes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.detalle_solicitudes_id_seq', 1, false);


--
-- Name: inspecciones_activos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inspecciones_activos_id_seq', 1, false);


--
-- Name: mantenimientos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.mantenimientos_id_seq', 8, true);


--
-- Name: movimientos_suministros_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.movimientos_suministros_id_seq', 1, false);


--
-- Name: obras_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.obras_id_seq', 2, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 17, true);


--
-- Name: solicitudes_activos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.solicitudes_activos_id_seq', 1, false);


--
-- Name: solicitudes_materiales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.solicitudes_materiales_id_seq', 1, false);


--
-- Name: suministros_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.suministros_id_seq', 18, true);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 20, true);


--
-- Name: activos_fijos activos_fijos_codigo_inventario_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activos_fijos
    ADD CONSTRAINT activos_fijos_codigo_inventario_key UNIQUE (codigo_inventario);


--
-- Name: activos_fijos activos_fijos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activos_fijos
    ADD CONSTRAINT activos_fijos_pkey PRIMARY KEY (id);


--
-- Name: almacen_suministros almacen_suministros_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.almacen_suministros
    ADD CONSTRAINT almacen_suministros_pkey PRIMARY KEY (almacen_id, suministro_id);


--
-- Name: almacenes almacenes_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.almacenes
    ADD CONSTRAINT almacenes_nombre_key UNIQUE (nombre);


--
-- Name: almacenes almacenes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.almacenes
    ADD CONSTRAINT almacenes_pkey PRIMARY KEY (id);


--
-- Name: asignaciones_activos asignaciones_activos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asignaciones_activos
    ADD CONSTRAINT asignaciones_activos_pkey PRIMARY KEY (id);


--
-- Name: categorias_suministros categorias_suministros_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias_suministros
    ADD CONSTRAINT categorias_suministros_pkey PRIMARY KEY (id);


--
-- Name: compras compras_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compras
    ADD CONSTRAINT compras_pkey PRIMARY KEY (id);


--
-- Name: detalle_compras detalle_compras_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_compras
    ADD CONSTRAINT detalle_compras_pkey PRIMARY KEY (id);


--
-- Name: detalle_solicitudes detalle_solicitudes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_solicitudes
    ADD CONSTRAINT detalle_solicitudes_pkey PRIMARY KEY (id);


--
-- Name: inspecciones_activos inspecciones_activos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inspecciones_activos
    ADD CONSTRAINT inspecciones_activos_pkey PRIMARY KEY (id);


--
-- Name: mantenimientos mantenimientos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mantenimientos
    ADD CONSTRAINT mantenimientos_pkey PRIMARY KEY (id);


--
-- Name: movimientos_suministros movimientos_suministros_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_suministros
    ADD CONSTRAINT movimientos_suministros_pkey PRIMARY KEY (id);


--
-- Name: obras obras_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.obras
    ADD CONSTRAINT obras_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: solicitudes_activos solicitudes_activos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes_activos
    ADD CONSTRAINT solicitudes_activos_pkey PRIMARY KEY (id);


--
-- Name: solicitudes_materiales solicitudes_materiales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes_materiales
    ADD CONSTRAINT solicitudes_materiales_pkey PRIMARY KEY (id);


--
-- Name: suministros suministros_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suministros
    ADD CONSTRAINT suministros_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: idx_inspecciones_activo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inspecciones_activo ON public.inspecciones_activos USING btree (activo_id);


--
-- Name: idx_mantenimientos_activo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_mantenimientos_activo ON public.mantenimientos USING btree (activo_id);


--
-- Name: almacen_suministros almacen_suministros_almacen_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.almacen_suministros
    ADD CONSTRAINT almacen_suministros_almacen_id_fkey FOREIGN KEY (almacen_id) REFERENCES public.almacenes(id) ON DELETE CASCADE;


--
-- Name: almacen_suministros almacen_suministros_suministro_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.almacen_suministros
    ADD CONSTRAINT almacen_suministros_suministro_id_fkey FOREIGN KEY (suministro_id) REFERENCES public.suministros(id) ON DELETE CASCADE;


--
-- Name: asignaciones_activos asignaciones_activos_activo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asignaciones_activos
    ADD CONSTRAINT asignaciones_activos_activo_id_fkey FOREIGN KEY (activo_id) REFERENCES public.activos_fijos(id);


--
-- Name: asignaciones_activos asignaciones_activos_obra_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asignaciones_activos
    ADD CONSTRAINT asignaciones_activos_obra_id_fkey FOREIGN KEY (obra_id) REFERENCES public.obras(id);


--
-- Name: asignaciones_activos asignaciones_activos_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asignaciones_activos
    ADD CONSTRAINT asignaciones_activos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- Name: compras compras_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compras
    ADD CONSTRAINT compras_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- Name: detalle_compras detalle_compras_compra_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_compras
    ADD CONSTRAINT detalle_compras_compra_id_fkey FOREIGN KEY (compra_id) REFERENCES public.compras(id) ON DELETE CASCADE;


--
-- Name: detalle_compras detalle_compras_suministro_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_compras
    ADD CONSTRAINT detalle_compras_suministro_id_fkey FOREIGN KEY (suministro_id) REFERENCES public.suministros(id);


--
-- Name: detalle_solicitudes detalle_solicitudes_solicitud_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_solicitudes
    ADD CONSTRAINT detalle_solicitudes_solicitud_id_fkey FOREIGN KEY (solicitud_id) REFERENCES public.solicitudes_materiales(id);


--
-- Name: detalle_solicitudes detalle_solicitudes_suministro_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_solicitudes
    ADD CONSTRAINT detalle_solicitudes_suministro_id_fkey FOREIGN KEY (suministro_id) REFERENCES public.suministros(id);


--
-- Name: inspecciones_activos inspecciones_activos_activo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inspecciones_activos
    ADD CONSTRAINT inspecciones_activos_activo_id_fkey FOREIGN KEY (activo_id) REFERENCES public.activos_fijos(id) ON DELETE CASCADE;


--
-- Name: inspecciones_activos inspecciones_activos_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inspecciones_activos
    ADD CONSTRAINT inspecciones_activos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- Name: mantenimientos mantenimientos_activo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mantenimientos
    ADD CONSTRAINT mantenimientos_activo_id_fkey FOREIGN KEY (activo_id) REFERENCES public.activos_fijos(id) ON DELETE CASCADE;


--
-- Name: movimientos_suministros movimientos_suministros_obra_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_suministros
    ADD CONSTRAINT movimientos_suministros_obra_id_fkey FOREIGN KEY (obra_id) REFERENCES public.obras(id);


--
-- Name: movimientos_suministros movimientos_suministros_suministro_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_suministros
    ADD CONSTRAINT movimientos_suministros_suministro_id_fkey FOREIGN KEY (suministro_id) REFERENCES public.suministros(id);


--
-- Name: movimientos_suministros movimientos_suministros_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_suministros
    ADD CONSTRAINT movimientos_suministros_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- Name: obras obras_supervisor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.obras
    ADD CONSTRAINT obras_supervisor_id_fkey FOREIGN KEY (supervisor_id) REFERENCES public.usuarios(id);


--
-- Name: solicitudes_activos solicitudes_activos_activo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes_activos
    ADD CONSTRAINT solicitudes_activos_activo_id_fkey FOREIGN KEY (activo_id) REFERENCES public.activos_fijos(id);


--
-- Name: solicitudes_activos solicitudes_activos_aprobado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes_activos
    ADD CONSTRAINT solicitudes_activos_aprobado_por_fkey FOREIGN KEY (aprobado_por) REFERENCES public.usuarios(id);


--
-- Name: solicitudes_activos solicitudes_activos_entregado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes_activos
    ADD CONSTRAINT solicitudes_activos_entregado_por_fkey FOREIGN KEY (entregado_por) REFERENCES public.usuarios(id);


--
-- Name: solicitudes_activos solicitudes_activos_obra_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes_activos
    ADD CONSTRAINT solicitudes_activos_obra_id_fkey FOREIGN KEY (obra_id) REFERENCES public.obras(id);


--
-- Name: solicitudes_activos solicitudes_activos_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes_activos
    ADD CONSTRAINT solicitudes_activos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- Name: solicitudes_materiales solicitudes_materiales_aprobado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes_materiales
    ADD CONSTRAINT solicitudes_materiales_aprobado_por_fkey FOREIGN KEY (aprobado_por) REFERENCES public.usuarios(id);


--
-- Name: solicitudes_materiales solicitudes_materiales_autorizado_por_contabilidad_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes_materiales
    ADD CONSTRAINT solicitudes_materiales_autorizado_por_contabilidad_fkey FOREIGN KEY (autorizado_por_contabilidad) REFERENCES public.usuarios(id);


--
-- Name: solicitudes_materiales solicitudes_materiales_entregado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes_materiales
    ADD CONSTRAINT solicitudes_materiales_entregado_por_fkey FOREIGN KEY (entregado_por) REFERENCES public.usuarios(id);


--
-- Name: solicitudes_materiales solicitudes_materiales_obra_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes_materiales
    ADD CONSTRAINT solicitudes_materiales_obra_id_fkey FOREIGN KEY (obra_id) REFERENCES public.obras(id);


--
-- Name: solicitudes_materiales solicitudes_materiales_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes_materiales
    ADD CONSTRAINT solicitudes_materiales_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- Name: suministros suministros_categoria_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suministros
    ADD CONSTRAINT suministros_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categorias_suministros(id);


--
-- Name: usuarios usuarios_rol_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_rol_id_fkey FOREIGN KEY (rol_id) REFERENCES public.roles(id);


--
-- PostgreSQL database dump complete
--

\unrestrict xd1Z8l06S70AJ8gVdU0IrKcSbRXSgmBsRp9Ga5S2CltFTmcbIynWIHAYH5Jsgvq


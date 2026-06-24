--
-- PostgreSQL database dump
--

\restrict K7q8YMreDSPfLbs7Lg61Vqmwf8B8NaIbrc94lxxL35hPfDUbrYQ5ibqq0UYbj42

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

-- Started on 2026-06-24 07:58:58

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
-- TOC entry 226 (class 1259 OID 16451)
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
-- TOC entry 225 (class 1259 OID 16450)
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
-- TOC entry 4982 (class 0 OID 0)
-- Dependencies: 225
-- Name: activos_fijos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.activos_fijos_id_seq OWNED BY public.activos_fijos.id;


--
-- TOC entry 239 (class 1259 OID 16632)
-- Name: almacen_suministros; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.almacen_suministros (
    almacen_id integer NOT NULL,
    suministro_id integer NOT NULL,
    stock integer DEFAULT 0
);


ALTER TABLE public.almacen_suministros OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 16623)
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
-- TOC entry 237 (class 1259 OID 16622)
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
-- TOC entry 4983 (class 0 OID 0)
-- Dependencies: 237
-- Name: almacenes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.almacenes_id_seq OWNED BY public.almacenes.id;


--
-- TOC entry 230 (class 1259 OID 16485)
-- Name: asignaciones_activos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asignaciones_activos (
    id integer NOT NULL,
    activo_id integer,
    obra_id integer,
    usuario_id integer,
    fecha_asignacion date,
    fecha_devolucion date,
    estado character varying(50),
    pdf_entrega character varying,
    pdf_devolucion character varying
);


ALTER TABLE public.asignaciones_activos OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16484)
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
-- TOC entry 4984 (class 0 OID 0)
-- Dependencies: 229
-- Name: asignaciones_activos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asignaciones_activos_id_seq OWNED BY public.asignaciones_activos.id;


--
-- TOC entry 222 (class 1259 OID 16429)
-- Name: categorias_suministros; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categorias_suministros (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL
);


ALTER TABLE public.categorias_suministros OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16428)
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
-- TOC entry 4985 (class 0 OID 0)
-- Dependencies: 221
-- Name: categorias_suministros_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categorias_suministros_id_seq OWNED BY public.categorias_suministros.id;


--
-- TOC entry 234 (class 1259 OID 16524)
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
-- TOC entry 233 (class 1259 OID 16523)
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
-- TOC entry 4986 (class 0 OID 0)
-- Dependencies: 233
-- Name: detalle_solicitudes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.detalle_solicitudes_id_seq OWNED BY public.detalle_solicitudes.id;


--
-- TOC entry 243 (class 1259 OID 16776)
-- Name: mantenimiento_activos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mantenimiento_activos (
    id integer NOT NULL,
    activo_id integer NOT NULL,
    tipo character varying(50) NOT NULL,
    descripcion text NOT NULL,
    fecha timestamp without time zone DEFAULT now() NOT NULL,
    responsable character varying(150),
    estado_resultante character varying(50),
    created_at timestamp without time zone DEFAULT now(),
    fecha_fin timestamp without time zone,
    estado_mantenimiento character varying(50) DEFAULT 'Completado'::character varying,
    CONSTRAINT mantenimiento_activos_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['Preventivo'::character varying, 'Correctivo'::character varying, 'Falla'::character varying, 'Inspección'::character varying, 'Cambio de Estado'::character varying])::text[])))
);


ALTER TABLE public.mantenimiento_activos OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 16775)
-- Name: mantenimiento_activos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mantenimiento_activos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mantenimiento_activos_id_seq OWNER TO postgres;

--
-- TOC entry 4987 (class 0 OID 0)
-- Dependencies: 242
-- Name: mantenimiento_activos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mantenimiento_activos_id_seq OWNED BY public.mantenimiento_activos.id;


--
-- TOC entry 241 (class 1259 OID 16661)
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
-- TOC entry 240 (class 1259 OID 16660)
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
-- TOC entry 4988 (class 0 OID 0)
-- Dependencies: 240
-- Name: mantenimientos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mantenimientos_id_seq OWNED BY public.mantenimientos.id;


--
-- TOC entry 228 (class 1259 OID 16462)
-- Name: movimientos_suministros; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.movimientos_suministros (
    id integer NOT NULL,
    suministro_id integer,
    tipo_movimiento character varying(20),
    cantidad integer,
    usuario_id integer,
    obra_id integer,
    fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    solicitud_id integer
);


ALTER TABLE public.movimientos_suministros OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16461)
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
-- TOC entry 4989 (class 0 OID 0)
-- Dependencies: 227
-- Name: movimientos_suministros_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.movimientos_suministros_id_seq OWNED BY public.movimientos_suministros.id;


--
-- TOC entry 220 (class 1259 OID 16422)
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
-- TOC entry 219 (class 1259 OID 16421)
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
-- TOC entry 4990 (class 0 OID 0)
-- Dependencies: 219
-- Name: obras_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.obras_id_seq OWNED BY public.obras.id;


--
-- TOC entry 216 (class 1259 OID 16400)
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    nombre character varying(50) NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 16399)
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
-- TOC entry 4991 (class 0 OID 0)
-- Dependencies: 215
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- TOC entry 236 (class 1259 OID 16560)
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
-- TOC entry 235 (class 1259 OID 16559)
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
-- TOC entry 4992 (class 0 OID 0)
-- Dependencies: 235
-- Name: solicitudes_activos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.solicitudes_activos_id_seq OWNED BY public.solicitudes_activos.id;


--
-- TOC entry 232 (class 1259 OID 16507)
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
-- TOC entry 231 (class 1259 OID 16506)
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
-- TOC entry 4993 (class 0 OID 0)
-- Dependencies: 231
-- Name: solicitudes_materiales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.solicitudes_materiales_id_seq OWNED BY public.solicitudes_materiales.id;


--
-- TOC entry 224 (class 1259 OID 16436)
-- Name: suministros; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.suministros (
    id integer NOT NULL,
    nombre character varying(150) NOT NULL,
    descripcion text,
    unidad character varying(20),
    stock integer DEFAULT 0,
    categoria_id integer,
    precio_unitario numeric(10,2) DEFAULT 0.00,
    stock_critico numeric(10,2) DEFAULT 0
);


ALTER TABLE public.suministros OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16435)
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
-- TOC entry 4994 (class 0 OID 0)
-- Dependencies: 223
-- Name: suministros_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.suministros_id_seq OWNED BY public.suministros.id;


--
-- TOC entry 218 (class 1259 OID 16407)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    rol_id integer,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    activo boolean DEFAULT true NOT NULL
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16406)
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
-- TOC entry 4995 (class 0 OID 0)
-- Dependencies: 217
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- TOC entry 4713 (class 2604 OID 16454)
-- Name: activos_fijos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activos_fijos ALTER COLUMN id SET DEFAULT nextval('public.activos_fijos_id_seq'::regclass);


--
-- TOC entry 4728 (class 2604 OID 16626)
-- Name: almacenes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.almacenes ALTER COLUMN id SET DEFAULT nextval('public.almacenes_id_seq'::regclass);


--
-- TOC entry 4721 (class 2604 OID 16488)
-- Name: asignaciones_activos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asignaciones_activos ALTER COLUMN id SET DEFAULT nextval('public.asignaciones_activos_id_seq'::regclass);


--
-- TOC entry 4708 (class 2604 OID 16432)
-- Name: categorias_suministros id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias_suministros ALTER COLUMN id SET DEFAULT nextval('public.categorias_suministros_id_seq'::regclass);


--
-- TOC entry 4723 (class 2604 OID 16527)
-- Name: detalle_solicitudes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_solicitudes ALTER COLUMN id SET DEFAULT nextval('public.detalle_solicitudes_id_seq'::regclass);


--
-- TOC entry 4734 (class 2604 OID 16779)
-- Name: mantenimiento_activos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mantenimiento_activos ALTER COLUMN id SET DEFAULT nextval('public.mantenimiento_activos_id_seq'::regclass);


--
-- TOC entry 4731 (class 2604 OID 16664)
-- Name: mantenimientos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mantenimientos ALTER COLUMN id SET DEFAULT nextval('public.mantenimientos_id_seq'::regclass);


--
-- TOC entry 4719 (class 2604 OID 16465)
-- Name: movimientos_suministros id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_suministros ALTER COLUMN id SET DEFAULT nextval('public.movimientos_suministros_id_seq'::regclass);


--
-- TOC entry 4707 (class 2604 OID 16425)
-- Name: obras id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.obras ALTER COLUMN id SET DEFAULT nextval('public.obras_id_seq'::regclass);


--
-- TOC entry 4703 (class 2604 OID 16403)
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- TOC entry 4725 (class 2604 OID 16563)
-- Name: solicitudes_activos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes_activos ALTER COLUMN id SET DEFAULT nextval('public.solicitudes_activos_id_seq'::regclass);


--
-- TOC entry 4722 (class 2604 OID 16510)
-- Name: solicitudes_materiales id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes_materiales ALTER COLUMN id SET DEFAULT nextval('public.solicitudes_materiales_id_seq'::regclass);


--
-- TOC entry 4709 (class 2604 OID 16439)
-- Name: suministros id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suministros ALTER COLUMN id SET DEFAULT nextval('public.suministros_id_seq'::regclass);


--
-- TOC entry 4704 (class 2604 OID 16410)
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- TOC entry 4959 (class 0 OID 16451)
-- Dependencies: 226
-- Data for Name: activos_fijos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.activos_fijos (id, nombre, descripcion, codigo_inventario, estado, fecha_compra, valor_inicial, valor_actual, depreciacion_acumulada, ubicacion, valor_residual, vida_util) FROM stdin;
15	Mezcladora de Concreto 5000L	Planta mezcladora o mezcladora industrial de gran capacidad. Capacidad nominal: 5.000 litros (5 m³). Sistema de mezclado de alta eficiencia. Motor eléctrico trifásico o diésel. Estructura de acero reforzado para producción continua de concreto en proyectos de gran escala.	act-009	Disponible	2026-06-06	0.00	0.00	0.00	Almacen Norte	0.00	5
12	Retroexcavadora JCB 3CX	Retroexcavadora multifuncional con tracción 4x4. Potencia del motor: 90–100 HP. Capacidad del cargador frontal: 1,0 m³. Profundidad máxima de excavación: 4–6 m. Cabina cerrada con controles hidráulicos.	ACT-002	Disponible	2024-06-20	95000.00	74047.93	20952.07	Almacen Sur	9500.00	8
13	Mezcladora de Concreto 500L	Mezcladora de tambor basculante. Capacidad nominal: 500 litros. Motor eléctrico o diésel según configuración. Producción aproximada: 6–8 m³/h. Chasis reforzado con sistema de transmisión por corona y piñón.	ACT-003	Disponible	2025-09-10	8500.00	7372.99	1127.01	Almacen Central	850.00	5
14	Compactadora Vibratoria BOMAG	Rodillo compactador vibratorio autopropulsado. Peso operativo: 7–12 toneladas (según modelo). Ancho de tambor: 1,5–2,1 m. Sistema de vibración de alta frecuencia para compactación de suelos y asfaltos. Motor diésel de bajo consumo.	ACT-004	Disponible	2023-12-05	22000.00	12090.01	9909.99	Almacen Sur	2200.00	5
11	Excavadora CAT 320	Excavadora hidráulica sobre orugas. Peso operativo aproximado: 20–22 toneladas. Potencia del motor: 150–170 HP. Capacidad de cuchara: 0,8–1,2 m³. Profundidad máxima de excavación: 6–7 m. Sistema hidráulico de alto rendimiento para movimiento de tierras y excavación pesada.	ACT-001	Disponible	2025-03-15	180000.00	160127.72	19872.28	Almacen Central	18000.00	10
\.


--
-- TOC entry 4972 (class 0 OID 16632)
-- Dependencies: 239
-- Data for Name: almacen_suministros; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.almacen_suministros (almacen_id, suministro_id, stock) FROM stdin;
4	19	250
1	20	100
4	22	2000
1	19	690
1	22	1950
1	21	200
2	20	270
\.


--
-- TOC entry 4971 (class 0 OID 16623)
-- Dependencies: 238
-- Data for Name: almacenes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.almacenes (id, nombre, ubicacion, fecha_creacion) FROM stdin;
2	Almacen Norte	Zona Norte	2026-03-19 17:10:09.714465
4	Almacen Sur	miraflores	2026-03-19 18:22:33.334818
1	Almacen Central	Oficina Principal	2026-03-19 16:45:45.388069
\.


--
-- TOC entry 4963 (class 0 OID 16485)
-- Dependencies: 230
-- Data for Name: asignaciones_activos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asignaciones_activos (id, activo_id, obra_id, usuario_id, fecha_asignacion, fecha_devolucion, estado, pdf_entrega, pdf_devolucion) FROM stdin;
9	14	2	3	2026-06-06	2026-06-06	devuelto	\N	\N
10	14	1	3	2026-06-06	2026-06-06	devuelto	\N	\N
11	12	2	3	2026-06-06	2026-06-06	devuelto	\N	\N
12	15	2	3	2026-06-06	2026-06-06	devuelto	\N	\N
13	12	1	3	2026-06-14	2026-06-14	devuelto	\N	\N
14	11	2	3	2026-06-24	2026-06-24	devuelto	\N	\N
15	15	2	3	2026-06-24	2026-06-24	Devuelto	/uploads/entregas/entrega-1782281844778-710894004.pdf	/uploads/entregas/entrega-1782281892187-679172271.pdf
\.


--
-- TOC entry 4955 (class 0 OID 16429)
-- Dependencies: 222
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
-- TOC entry 4967 (class 0 OID 16524)
-- Dependencies: 234
-- Data for Name: detalle_solicitudes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.detalle_solicitudes (id, solicitud_id, suministro_id, cantidad, cantidad_solicitada, cantidad_disponible, faltante, cantidad_entregada, saldo_pendiente) FROM stdin;
4	3	22	50	50	50	0	50	0
5	4	19	20	20	20	0	20	0
6	4	21	250	250	20	230	250	0
7	5	21	50	50	50	0	50	0
8	5	19	40	40	40	0	40	0
9	5	22	1000	1000	1000	0	1000	0
10	6	21	20	20	20	0	20	0
11	7	20	30	30	30	0	30	0
12	8	19	1	1	1	0	0	1
\.


--
-- TOC entry 4976 (class 0 OID 16776)
-- Dependencies: 243
-- Data for Name: mantenimiento_activos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mantenimiento_activos (id, activo_id, tipo, descripcion, fecha, responsable, estado_resultante, created_at, fecha_fin, estado_mantenimiento) FROM stdin;
15	14	Cambio de Estado	Cambio de estado: disponible → Disponible	2026-06-05 23:34:48.887841	Usuario ID 1	Disponible	2026-06-05 23:34:48.887841	\N	Completado
16	14	Cambio de Estado	Cambio de estado: Disponible → Asignado	2026-06-05 23:34:54.622322	Usuario ID 1	Asignado	2026-06-05 23:34:54.622322	\N	Completado
17	14	Cambio de Estado	Cambio de estado: Asignado → Mantenimiento	2026-06-05 23:34:59.895188	Usuario ID 1	Mantenimiento	2026-06-05 23:34:59.895188	\N	Completado
18	14	Cambio de Estado	Cambio de estado: Mantenimiento → Disponible	2026-06-05 23:40:37.414063	Usuario ID 1	Disponible	2026-06-05 23:40:37.414063	\N	Completado
19	14	Cambio de Estado	Cambio de estado: Disponible → Mantenimiento	2026-06-05 23:41:03.03851	Usuario ID 1	Mantenimiento	2026-06-05 23:41:03.03851	\N	Completado
20	13	Correctivo	error\n\nNotas finales: finalizo	2026-06-05 23:57:53.489048	Usuario ID 1	Disponible	2026-06-05 23:57:53.489048	2026-06-05 23:58:11.214602	Completado
21	13	Falla	Cambio de aceite	2026-06-05 23:59:07.910359	Usuario ID 1	Disponible	2026-06-05 23:59:07.910359	2026-06-05 23:59:22.404353	Completado
22	15	Falla	acetite\n\nNotas finales: costo	2026-06-06 12:28:10.451937	Usuario ID 1	Disponible	2026-06-06 12:28:10.451937	2026-06-06 12:28:32.695984	Completado
23	15	Falla	falla	2026-06-06 12:29:55.789301	Usuario ID 1	Disponible	2026-06-06 12:29:55.789301	2026-06-06 12:30:04.920687	Completado
24	12	Falla	fallo\n\nNotas finales: ya esta	2026-06-13 20:17:40.47484	Usuario ID 1	Disponible	2026-06-13 20:17:40.47484	2026-06-13 20:20:07.055682	Completado
\.


--
-- TOC entry 4974 (class 0 OID 16661)
-- Dependencies: 241
-- Data for Name: mantenimientos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mantenimientos (id, activo_id, fecha_mantenimiento, tipo_mantenimiento, descripcion, costo, tecnico, proximo_mantenimiento) FROM stdin;
\.


--
-- TOC entry 4961 (class 0 OID 16462)
-- Dependencies: 228
-- Data for Name: movimientos_suministros; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.movimientos_suministros (id, suministro_id, tipo_movimiento, cantidad, usuario_id, obra_id, fecha, solicitud_id) FROM stdin;
3	19	entrada	500	1	\N	2026-06-06 00:37:30.308704	\N
4	20	entrada	300	1	\N	2026-06-06 00:38:34.194894	\N
5	21	entrada	120	1	\N	2026-06-06 00:39:10.745005	\N
6	22	entrada	5000	1	\N	2026-06-06 00:40:00.307679	\N
7	22	salida	50	2	2	2026-06-06 00:52:05.706333	\N
8	21	entrada	5	1	\N	2026-06-06 12:51:58.29449	\N
9	20	entrada	100	1	\N	2026-06-06 12:51:58.29449	\N
10	19	entrada	500	1	\N	2026-06-06 12:51:58.29449	\N
20	19	salida	20	2	1	2026-06-06 12:55:54.493467	\N
21	21	salida	20	2	1	2026-06-06 12:55:54.493467	\N
22	21	entrada	500	1	\N	2026-06-06 12:56:27.173018	\N
23	21	salida	230	2	1	2026-06-06 12:56:41.129392	\N
24	21	salida	50	1	1	2026-06-13 20:39:30.632822	\N
25	19	salida	40	1	1	2026-06-13 20:39:30.632822	\N
26	22	salida	1000	1	1	2026-06-13 20:39:30.632822	\N
27	21	salida	20	1	2	2026-06-22 22:54:43.437062	\N
28	20	salida	30	1	2	2026-06-24 00:49:41.520549	7
\.


--
-- TOC entry 4953 (class 0 OID 16422)
-- Dependencies: 220
-- Data for Name: obras; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.obras (id, nombre, ubicacion, fecha_inicio, fecha_fin, supervisor_id) FROM stdin;
2	Puente Rio Seco	El Alto	2026-02-01	2026-08-31	3
1	Edificio Central	La Paz	2026-01-01	2026-12-31	3
\.


--
-- TOC entry 4949 (class 0 OID 16400)
-- Dependencies: 216
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
-- TOC entry 4969 (class 0 OID 16560)
-- Dependencies: 236
-- Data for Name: solicitudes_activos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.solicitudes_activos (id, activo_id, obra_id, usuario_id, fecha_solicitud, fecha_inicio, fecha_fin, estado, aprobado_por, fecha_aprobacion, comentario, entregado_por, pdf_entrega) FROM stdin;
1	14	2	3	2026-06-05 23:08:34.297379	2026-05-06	2026-05-07	asignado	1	2026-06-05 23:08:55.760299	detalle	\N	\N
2	14	1	3	2026-06-05 23:11:44.577414	2026-06-04	2026-06-07	asignado	1	2026-06-05 23:11:55.549114		\N	\N
3	12	2	3	2026-06-05 23:14:14.983428	2026-05-08	2026-05-10	asignado	1	2026-06-05 23:17:40.580822		\N	\N
4	15	2	3	2026-06-06 12:33:35.748701	2026-06-05	2026-06-07	asignado	3	2026-06-06 12:33:52.892738	comentario	\N	\N
5	12	1	3	2026-06-13 20:22:47.024189	2026-06-11	2026-06-14	asignado	1	2026-06-13 20:23:52.468486	a	\N	\N
6	11	2	3	2026-06-24 01:01:27.187538	2026-06-23	2026-06-25	rechazado	3	2026-06-24 01:01:42.77498	deyalles tecnicos	\N	\N
7	11	2	3	2026-06-24 01:38:13.70569	2026-06-23	2026-06-25	asignado	1	2026-06-24 01:39:57.736236		\N	\N
8	15	2	3	2026-06-24 01:46:51.780522	2026-06-08	2026-06-09	Asignado	1	2026-06-24 01:48:44.437144		\N	\N
\.


--
-- TOC entry 4965 (class 0 OID 16507)
-- Dependencies: 232
-- Data for Name: solicitudes_materiales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.solicitudes_materiales (id, obra_id, usuario_id, fecha_solicitud, estado, aprobado_por, fecha_aprobacion, autorizado_por_contabilidad, fecha_autorizacion, entregado_por, pdf_entrega, almacen_recogida_id) FROM stdin;
3	2	3	2026-06-06	Entregado Totalmente	3	2026-06-06 00:50:12.145469	\N	\N	2	\N	1
4	1	3	2026-06-06	Entregado Totalmente	1	2026-06-06 12:54:12.60476	\N	\N	2	/uploads/entregas/entrega-1780764954491-811773974.pdf	1
5	1	3	2026-06-13	Entregado Totalmente	1	2026-06-13 20:37:37.306143	\N	\N	1	/uploads/entregas/entrega-1781397570624-976310335.pdf	1
6	2	1	2026-06-22	Entregado Totalmente	1	2026-06-22 22:52:17.26704	\N	\N	1	\N	1
7	2	1	2026-06-24	Entregado Totalmente	1	2026-06-24 00:27:22.30236	\N	\N	1	/uploads/entregas/entrega-1782276581485-863254518.pdf	2
8	2	3	2026-06-24	Aprobado	3	2026-06-24 07:08:18.555405	\N	\N	\N	\N	\N
\.


--
-- TOC entry 4957 (class 0 OID 16436)
-- Dependencies: 224
-- Data for Name: suministros; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.suministros (id, nombre, descripcion, unidad, stock, categoria_id, precio_unitario, stock_critico) FROM stdin;
19	Cemento Portland IP-30	Cemento para la elaboración de hormigón y morteros.	Bolsa	940	1	65.00	50.00
22	Ladrillo Cerámico 6 Huecos	Material utilizado para la construcción de muros y tabiques.	unidad	3950	1	2.50	500.00
20	Fierro Corrugado 12 mm	Acero de refuerzo para estructuras de hormigón armado.	Barra	370	2	110.00	30.00
21	Arena Fina	Arena utilizada para mezclas, revoques y acabados.	m³	200	1	180.00	15.00
\.


--
-- TOC entry 4951 (class 0 OID 16407)
-- Dependencies: 218
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id, nombre, email, password, rol_id, creado_en, activo) FROM stdin;
1	Erick Quispe	erick@macavilpaz.com	$2b$10$9BHYkTC33e9OnGpFya6sNuuQMoULIidu3O10ADXUgUqHdRHmh3Zje	1	2026-03-15 19:12:06.272186	t
2	Carlos Pérez	carlos@macavilpaz.com	$2b$10$9BHYkTC33e9OnGpFya6sNuuQMoULIidu3O10ADXUgUqHdRHmh3Zje	2	2026-03-15 19:12:06.272186	t
19	Test Tecnico	tecnico@test.com	$2b$10$9BHYkTC33e9OnGpFya6sNuuQMoULIidu3O10ADXUgUqHdRHmh3Zje	16	2026-03-17 15:16:36.298206	t
3	Juan Torres	ana@macavilpaz.com	$2b$10$9BHYkTC33e9OnGpFya6sNuuQMoULIidu3O10ADXUgUqHdRHmh3Zje	3	2026-03-15 19:12:06.272186	t
\.


--
-- TOC entry 4996 (class 0 OID 0)
-- Dependencies: 225
-- Name: activos_fijos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.activos_fijos_id_seq', 15, true);


--
-- TOC entry 4997 (class 0 OID 0)
-- Dependencies: 237
-- Name: almacenes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.almacenes_id_seq', 4, true);


--
-- TOC entry 4998 (class 0 OID 0)
-- Dependencies: 229
-- Name: asignaciones_activos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asignaciones_activos_id_seq', 15, true);


--
-- TOC entry 4999 (class 0 OID 0)
-- Dependencies: 221
-- Name: categorias_suministros_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categorias_suministros_id_seq', 7, true);


--
-- TOC entry 5000 (class 0 OID 0)
-- Dependencies: 233
-- Name: detalle_solicitudes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.detalle_solicitudes_id_seq', 12, true);


--
-- TOC entry 5001 (class 0 OID 0)
-- Dependencies: 242
-- Name: mantenimiento_activos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.mantenimiento_activos_id_seq', 24, true);


--
-- TOC entry 5002 (class 0 OID 0)
-- Dependencies: 240
-- Name: mantenimientos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.mantenimientos_id_seq', 8, true);


--
-- TOC entry 5003 (class 0 OID 0)
-- Dependencies: 227
-- Name: movimientos_suministros_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.movimientos_suministros_id_seq', 28, true);


--
-- TOC entry 5004 (class 0 OID 0)
-- Dependencies: 219
-- Name: obras_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.obras_id_seq', 2, true);


--
-- TOC entry 5005 (class 0 OID 0)
-- Dependencies: 215
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 17, true);


--
-- TOC entry 5006 (class 0 OID 0)
-- Dependencies: 235
-- Name: solicitudes_activos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.solicitudes_activos_id_seq', 8, true);


--
-- TOC entry 5007 (class 0 OID 0)
-- Dependencies: 231
-- Name: solicitudes_materiales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.solicitudes_materiales_id_seq', 8, true);


--
-- TOC entry 5008 (class 0 OID 0)
-- Dependencies: 223
-- Name: suministros_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.suministros_id_seq', 22, true);


--
-- TOC entry 5009 (class 0 OID 0)
-- Dependencies: 217
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 24, true);


--
-- TOC entry 4753 (class 2606 OID 16460)
-- Name: activos_fijos activos_fijos_codigo_inventario_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activos_fijos
    ADD CONSTRAINT activos_fijos_codigo_inventario_key UNIQUE (codigo_inventario);


--
-- TOC entry 4755 (class 2606 OID 16458)
-- Name: activos_fijos activos_fijos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activos_fijos
    ADD CONSTRAINT activos_fijos_pkey PRIMARY KEY (id);


--
-- TOC entry 4771 (class 2606 OID 16637)
-- Name: almacen_suministros almacen_suministros_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.almacen_suministros
    ADD CONSTRAINT almacen_suministros_pkey PRIMARY KEY (almacen_id, suministro_id);


--
-- TOC entry 4767 (class 2606 OID 16631)
-- Name: almacenes almacenes_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.almacenes
    ADD CONSTRAINT almacenes_nombre_key UNIQUE (nombre);


--
-- TOC entry 4769 (class 2606 OID 16629)
-- Name: almacenes almacenes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.almacenes
    ADD CONSTRAINT almacenes_pkey PRIMARY KEY (id);


--
-- TOC entry 4759 (class 2606 OID 16490)
-- Name: asignaciones_activos asignaciones_activos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asignaciones_activos
    ADD CONSTRAINT asignaciones_activos_pkey PRIMARY KEY (id);


--
-- TOC entry 4749 (class 2606 OID 16434)
-- Name: categorias_suministros categorias_suministros_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias_suministros
    ADD CONSTRAINT categorias_suministros_pkey PRIMARY KEY (id);


--
-- TOC entry 4763 (class 2606 OID 16529)
-- Name: detalle_solicitudes detalle_solicitudes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_solicitudes
    ADD CONSTRAINT detalle_solicitudes_pkey PRIMARY KEY (id);


--
-- TOC entry 4738 (class 2606 OID 16797)
-- Name: mantenimiento_activos mantenimiento_activos_estado_resultante_check; Type: CHECK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE public.mantenimiento_activos
    ADD CONSTRAINT mantenimiento_activos_estado_resultante_check CHECK (((estado_resultante)::text = ANY ((ARRAY['Disponible'::character varying, 'Asignado'::character varying, 'Mantenimiento'::character varying])::text[]))) NOT VALID;


--
-- TOC entry 4778 (class 2606 OID 16787)
-- Name: mantenimiento_activos mantenimiento_activos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mantenimiento_activos
    ADD CONSTRAINT mantenimiento_activos_pkey PRIMARY KEY (id);


--
-- TOC entry 4774 (class 2606 OID 16670)
-- Name: mantenimientos mantenimientos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mantenimientos
    ADD CONSTRAINT mantenimientos_pkey PRIMARY KEY (id);


--
-- TOC entry 4757 (class 2606 OID 16468)
-- Name: movimientos_suministros movimientos_suministros_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_suministros
    ADD CONSTRAINT movimientos_suministros_pkey PRIMARY KEY (id);


--
-- TOC entry 4747 (class 2606 OID 16427)
-- Name: obras obras_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.obras
    ADD CONSTRAINT obras_pkey PRIMARY KEY (id);


--
-- TOC entry 4741 (class 2606 OID 16405)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 4765 (class 2606 OID 16569)
-- Name: solicitudes_activos solicitudes_activos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes_activos
    ADD CONSTRAINT solicitudes_activos_pkey PRIMARY KEY (id);


--
-- TOC entry 4761 (class 2606 OID 16512)
-- Name: solicitudes_materiales solicitudes_materiales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes_materiales
    ADD CONSTRAINT solicitudes_materiales_pkey PRIMARY KEY (id);


--
-- TOC entry 4751 (class 2606 OID 16444)
-- Name: suministros suministros_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suministros
    ADD CONSTRAINT suministros_pkey PRIMARY KEY (id);


--
-- TOC entry 4743 (class 2606 OID 16415)
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- TOC entry 4745 (class 2606 OID 16413)
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- TOC entry 4775 (class 1259 OID 16793)
-- Name: idx_mantenimiento_activo_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_mantenimiento_activo_id ON public.mantenimiento_activos USING btree (activo_id);


--
-- TOC entry 4776 (class 1259 OID 16794)
-- Name: idx_mantenimiento_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_mantenimiento_fecha ON public.mantenimiento_activos USING btree (fecha DESC);


--
-- TOC entry 4772 (class 1259 OID 16697)
-- Name: idx_mantenimientos_activo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_mantenimientos_activo ON public.mantenimientos USING btree (activo_id);


--
-- TOC entry 4801 (class 2606 OID 16638)
-- Name: almacen_suministros almacen_suministros_almacen_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.almacen_suministros
    ADD CONSTRAINT almacen_suministros_almacen_id_fkey FOREIGN KEY (almacen_id) REFERENCES public.almacenes(id) ON DELETE CASCADE;


--
-- TOC entry 4802 (class 2606 OID 16643)
-- Name: almacen_suministros almacen_suministros_suministro_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.almacen_suministros
    ADD CONSTRAINT almacen_suministros_suministro_id_fkey FOREIGN KEY (suministro_id) REFERENCES public.suministros(id) ON DELETE CASCADE;


--
-- TOC entry 4786 (class 2606 OID 16491)
-- Name: asignaciones_activos asignaciones_activos_activo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asignaciones_activos
    ADD CONSTRAINT asignaciones_activos_activo_id_fkey FOREIGN KEY (activo_id) REFERENCES public.activos_fijos(id);


--
-- TOC entry 4787 (class 2606 OID 16496)
-- Name: asignaciones_activos asignaciones_activos_obra_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asignaciones_activos
    ADD CONSTRAINT asignaciones_activos_obra_id_fkey FOREIGN KEY (obra_id) REFERENCES public.obras(id);


--
-- TOC entry 4788 (class 2606 OID 16501)
-- Name: asignaciones_activos asignaciones_activos_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asignaciones_activos
    ADD CONSTRAINT asignaciones_activos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- TOC entry 4794 (class 2606 OID 16530)
-- Name: detalle_solicitudes detalle_solicitudes_solicitud_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_solicitudes
    ADD CONSTRAINT detalle_solicitudes_solicitud_id_fkey FOREIGN KEY (solicitud_id) REFERENCES public.solicitudes_materiales(id);


--
-- TOC entry 4795 (class 2606 OID 16535)
-- Name: detalle_solicitudes detalle_solicitudes_suministro_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_solicitudes
    ADD CONSTRAINT detalle_solicitudes_suministro_id_fkey FOREIGN KEY (suministro_id) REFERENCES public.suministros(id);


--
-- TOC entry 4804 (class 2606 OID 16788)
-- Name: mantenimiento_activos mantenimiento_activos_activo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mantenimiento_activos
    ADD CONSTRAINT mantenimiento_activos_activo_id_fkey FOREIGN KEY (activo_id) REFERENCES public.activos_fijos(id) ON DELETE CASCADE;


--
-- TOC entry 4803 (class 2606 OID 16671)
-- Name: mantenimientos mantenimientos_activo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mantenimientos
    ADD CONSTRAINT mantenimientos_activo_id_fkey FOREIGN KEY (activo_id) REFERENCES public.activos_fijos(id) ON DELETE CASCADE;


--
-- TOC entry 4782 (class 2606 OID 16479)
-- Name: movimientos_suministros movimientos_suministros_obra_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_suministros
    ADD CONSTRAINT movimientos_suministros_obra_id_fkey FOREIGN KEY (obra_id) REFERENCES public.obras(id);


--
-- TOC entry 4783 (class 2606 OID 16844)
-- Name: movimientos_suministros movimientos_suministros_solicitud_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_suministros
    ADD CONSTRAINT movimientos_suministros_solicitud_id_fkey FOREIGN KEY (solicitud_id) REFERENCES public.solicitudes_materiales(id);


--
-- TOC entry 4784 (class 2606 OID 16469)
-- Name: movimientos_suministros movimientos_suministros_suministro_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_suministros
    ADD CONSTRAINT movimientos_suministros_suministro_id_fkey FOREIGN KEY (suministro_id) REFERENCES public.suministros(id);


--
-- TOC entry 4785 (class 2606 OID 16474)
-- Name: movimientos_suministros movimientos_suministros_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_suministros
    ADD CONSTRAINT movimientos_suministros_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- TOC entry 4780 (class 2606 OID 16540)
-- Name: obras obras_supervisor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.obras
    ADD CONSTRAINT obras_supervisor_id_fkey FOREIGN KEY (supervisor_id) REFERENCES public.usuarios(id);


--
-- TOC entry 4796 (class 2606 OID 16570)
-- Name: solicitudes_activos solicitudes_activos_activo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes_activos
    ADD CONSTRAINT solicitudes_activos_activo_id_fkey FOREIGN KEY (activo_id) REFERENCES public.activos_fijos(id);


--
-- TOC entry 4797 (class 2606 OID 16585)
-- Name: solicitudes_activos solicitudes_activos_aprobado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes_activos
    ADD CONSTRAINT solicitudes_activos_aprobado_por_fkey FOREIGN KEY (aprobado_por) REFERENCES public.usuarios(id);


--
-- TOC entry 4798 (class 2606 OID 16654)
-- Name: solicitudes_activos solicitudes_activos_entregado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes_activos
    ADD CONSTRAINT solicitudes_activos_entregado_por_fkey FOREIGN KEY (entregado_por) REFERENCES public.usuarios(id);


--
-- TOC entry 4799 (class 2606 OID 16575)
-- Name: solicitudes_activos solicitudes_activos_obra_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes_activos
    ADD CONSTRAINT solicitudes_activos_obra_id_fkey FOREIGN KEY (obra_id) REFERENCES public.obras(id);


--
-- TOC entry 4800 (class 2606 OID 16580)
-- Name: solicitudes_activos solicitudes_activos_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes_activos
    ADD CONSTRAINT solicitudes_activos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- TOC entry 4789 (class 2606 OID 16546)
-- Name: solicitudes_materiales solicitudes_materiales_aprobado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes_materiales
    ADD CONSTRAINT solicitudes_materiales_aprobado_por_fkey FOREIGN KEY (aprobado_por) REFERENCES public.usuarios(id);


--
-- TOC entry 4790 (class 2606 OID 16551)
-- Name: solicitudes_materiales solicitudes_materiales_autorizado_por_contabilidad_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes_materiales
    ADD CONSTRAINT solicitudes_materiales_autorizado_por_contabilidad_fkey FOREIGN KEY (autorizado_por_contabilidad) REFERENCES public.usuarios(id);


--
-- TOC entry 4791 (class 2606 OID 16649)
-- Name: solicitudes_materiales solicitudes_materiales_entregado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes_materiales
    ADD CONSTRAINT solicitudes_materiales_entregado_por_fkey FOREIGN KEY (entregado_por) REFERENCES public.usuarios(id);


--
-- TOC entry 4792 (class 2606 OID 16513)
-- Name: solicitudes_materiales solicitudes_materiales_obra_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes_materiales
    ADD CONSTRAINT solicitudes_materiales_obra_id_fkey FOREIGN KEY (obra_id) REFERENCES public.obras(id);


--
-- TOC entry 4793 (class 2606 OID 16518)
-- Name: solicitudes_materiales solicitudes_materiales_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes_materiales
    ADD CONSTRAINT solicitudes_materiales_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- TOC entry 4781 (class 2606 OID 16445)
-- Name: suministros suministros_categoria_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suministros
    ADD CONSTRAINT suministros_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categorias_suministros(id);


--
-- TOC entry 4779 (class 2606 OID 16416)
-- Name: usuarios usuarios_rol_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_rol_id_fkey FOREIGN KEY (rol_id) REFERENCES public.roles(id);


-- Completed on 2026-06-24 07:58:59

--
-- PostgreSQL database dump complete
--

\unrestrict K7q8YMreDSPfLbs7Lg61Vqmwf8B8NaIbrc94lxxL35hPfDUbrYQ5ibqq0UYbj42


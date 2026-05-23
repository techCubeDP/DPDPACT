--
-- PostgreSQL database dump
--

\restrict YnyIN85Br4UaQ7HArLrpu3WGXboSEMLeLtBr1k1dXoG70aEPenJZTM3McmjDfDX

-- Dumped from database version 15.18 (Debian 15.18-1.pgdg13+1)
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
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
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    user_id integer,
    action character varying(100),
    details jsonb,
    file_id integer,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.audit_logs OWNER TO admin;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_id_seq OWNER TO admin;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: breach_alerts; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.breach_alerts (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    severity character varying(50) DEFAULT 'medium'::character varying,
    description text NOT NULL,
    affected_records integer DEFAULT 0,
    detected_at timestamp without time zone DEFAULT now(),
    status character varying(50) DEFAULT 'open'::character varying,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.breach_alerts OWNER TO admin;

--
-- Name: breach_alerts_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.breach_alerts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.breach_alerts_id_seq OWNER TO admin;

--
-- Name: breach_alerts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.breach_alerts_id_seq OWNED BY public.breach_alerts.id;


--
-- Name: compliance_items; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.compliance_items (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    category character varying(100) NOT NULL,
    mandatory boolean DEFAULT true,
    completed boolean DEFAULT false,
    completed_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.compliance_items OWNER TO admin;

--
-- Name: compliance_items_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.compliance_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.compliance_items_id_seq OWNER TO admin;

--
-- Name: compliance_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.compliance_items_id_seq OWNED BY public.compliance_items.id;


--
-- Name: database_scan_results; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.database_scan_results (
    id integer NOT NULL,
    user_id integer,
    db_type character varying(100),
    db_name character varying(255),
    table_name character varying(255),
    column_name character varying(255),
    data_type character varying(100),
    is_pii boolean,
    pii_classification character varying(50),
    scanned_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.database_scan_results OWNER TO admin;

--
-- Name: database_scan_results_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.database_scan_results_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.database_scan_results_id_seq OWNER TO admin;

--
-- Name: database_scan_results_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.database_scan_results_id_seq OWNED BY public.database_scan_results.id;


--
-- Name: departments; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.departments (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now(),
    head_email character varying(100)
);


ALTER TABLE public.departments OWNER TO admin;

--
-- Name: departments_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.departments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.departments_id_seq OWNER TO admin;

--
-- Name: departments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.departments_id_seq OWNED BY public.departments.id;


--
-- Name: discovery_results; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.discovery_results (
    id integer NOT NULL,
    user_id integer,
    scan_type character varying(100),
    results jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.discovery_results OWNER TO admin;

--
-- Name: discovery_results_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.discovery_results_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.discovery_results_id_seq OWNER TO admin;

--
-- Name: discovery_results_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.discovery_results_id_seq OWNED BY public.discovery_results.id;


--
-- Name: employees; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.employees (
    id integer NOT NULL,
    emp_name character varying(100),
    emp_id character varying(20),
    salary numeric(10,2)
);


ALTER TABLE public.employees OWNER TO admin;

--
-- Name: employees_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.employees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employees_id_seq OWNER TO admin;

--
-- Name: employees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.employees_id_seq OWNED BY public.employees.id;


--
-- Name: external_data_sources; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.external_data_sources (
    id integer NOT NULL,
    user_id integer,
    name character varying(255),
    type character varying(100),
    config jsonb,
    last_scanned timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.external_data_sources OWNER TO admin;

--
-- Name: external_data_sources_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.external_data_sources_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.external_data_sources_id_seq OWNER TO admin;

--
-- Name: external_data_sources_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.external_data_sources_id_seq OWNED BY public.external_data_sources.id;


--
-- Name: file_downloads; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.file_downloads (
    id integer NOT NULL,
    file_share_id integer,
    downloaded_by integer,
    download_time timestamp without time zone DEFAULT now(),
    ip_address character varying(50)
);


ALTER TABLE public.file_downloads OWNER TO admin;

--
-- Name: file_downloads_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.file_downloads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.file_downloads_id_seq OWNER TO admin;

--
-- Name: file_downloads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.file_downloads_id_seq OWNED BY public.file_downloads.id;


--
-- Name: file_pii_detection; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.file_pii_detection (
    id integer NOT NULL,
    file_id integer,
    pii_type character varying(50),
    detected_count integer,
    detected_values text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.file_pii_detection OWNER TO admin;

--
-- Name: file_pii_detection_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.file_pii_detection_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.file_pii_detection_id_seq OWNER TO admin;

--
-- Name: file_pii_detection_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.file_pii_detection_id_seq OWNED BY public.file_pii_detection.id;


--
-- Name: file_retention; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.file_retention (
    id integer NOT NULL,
    file_id integer,
    retention_days integer DEFAULT 365,
    deletion_scheduled_at timestamp without time zone,
    deleted_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.file_retention OWNER TO admin;

--
-- Name: file_retention_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.file_retention_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.file_retention_id_seq OWNER TO admin;

--
-- Name: file_retention_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.file_retention_id_seq OWNED BY public.file_retention.id;


--
-- Name: file_shares; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.file_shares (
    id integer NOT NULL,
    file_id integer,
    sender_id integer,
    receiver_department_id integer,
    purpose character varying(255),
    approval_status character varying(50) DEFAULT 'pending'::character varying,
    approved_by integer,
    approved_at timestamp without time zone,
    shared_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.file_shares OWNER TO admin;

--
-- Name: file_shares_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.file_shares_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.file_shares_id_seq OWNER TO admin;

--
-- Name: file_shares_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.file_shares_id_seq OWNED BY public.file_shares.id;


--
-- Name: files; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.files (
    id integer NOT NULL,
    filename character varying(255) NOT NULL,
    file_path character varying(255) NOT NULL,
    file_size bigint,
    uploaded_by integer,
    department_id integer,
    file_type character varying(50),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.files OWNER TO admin;

--
-- Name: files_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.files_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.files_id_seq OWNER TO admin;

--
-- Name: files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.files_id_seq OWNED BY public.files.id;


--
-- Name: s3_scan_results; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.s3_scan_results (
    id integer NOT NULL,
    user_id integer,
    bucket_name character varying(255),
    object_key character varying(1024),
    file_size bigint,
    file_type character varying(50),
    has_pii boolean,
    pii_types text[],
    scanned_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.s3_scan_results OWNER TO admin;

--
-- Name: s3_scan_results_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.s3_scan_results_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.s3_scan_results_id_seq OWNER TO admin;

--
-- Name: s3_scan_results_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.s3_scan_results_id_seq OWNED BY public.s3_scan_results.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    department character varying(100),
    role character varying(50) DEFAULT 'user'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO admin;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO admin;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: breach_alerts id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.breach_alerts ALTER COLUMN id SET DEFAULT nextval('public.breach_alerts_id_seq'::regclass);


--
-- Name: compliance_items id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.compliance_items ALTER COLUMN id SET DEFAULT nextval('public.compliance_items_id_seq'::regclass);


--
-- Name: database_scan_results id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.database_scan_results ALTER COLUMN id SET DEFAULT nextval('public.database_scan_results_id_seq'::regclass);


--
-- Name: departments id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);


--
-- Name: discovery_results id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.discovery_results ALTER COLUMN id SET DEFAULT nextval('public.discovery_results_id_seq'::regclass);


--
-- Name: employees id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.employees ALTER COLUMN id SET DEFAULT nextval('public.employees_id_seq'::regclass);


--
-- Name: external_data_sources id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.external_data_sources ALTER COLUMN id SET DEFAULT nextval('public.external_data_sources_id_seq'::regclass);


--
-- Name: file_downloads id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.file_downloads ALTER COLUMN id SET DEFAULT nextval('public.file_downloads_id_seq'::regclass);


--
-- Name: file_pii_detection id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.file_pii_detection ALTER COLUMN id SET DEFAULT nextval('public.file_pii_detection_id_seq'::regclass);


--
-- Name: file_retention id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.file_retention ALTER COLUMN id SET DEFAULT nextval('public.file_retention_id_seq'::regclass);


--
-- Name: file_shares id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.file_shares ALTER COLUMN id SET DEFAULT nextval('public.file_shares_id_seq'::regclass);


--
-- Name: files id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.files ALTER COLUMN id SET DEFAULT nextval('public.files_id_seq'::regclass);


--
-- Name: s3_scan_results id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.s3_scan_results ALTER COLUMN id SET DEFAULT nextval('public.s3_scan_results_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.audit_logs (id, user_id, action, details, file_id, created_at) FROM stdin;
1	11	FILE_UPLOADED	{"size": 500, "type": ".txt", "filename": "Personal_Data.txt"}	5	2026-05-22 17:44:38.726649
2	11	FILE_SHARED	{"purpose": "Personal Data", "shareId": 2, "receiverDepartmentId": 10}	5	2026-05-22 17:47:19.637356
3	11	FILE_SHARED	{"purpose": "Personal", "shareId": 3, "receiverDepartmentId": 10}	5	2026-05-22 17:50:00.753919
4	12	SHARE_APPROVED	{"status": "approved", "shareId": "3"}	\N	2026-05-22 17:50:33.636039
5	12	SHARE_APPROVED	{"status": "approved", "shareId": "2"}	\N	2026-05-22 17:50:41.351789
6	11	FILE_UPLOADED	{"size": 10, "type": ".txt", "filename": "Non_Personal_Data.txt"}	6	2026-05-22 18:01:59.385105
7	11	FILE_SHARED	{"purpose": "Non Personal Data", "shareId": 4, "receiverDepartmentId": 10}	6	2026-05-22 18:05:11.819567
8	12	SHARE_APPROVED	{"status": "approved", "shareId": "4"}	\N	2026-05-22 18:05:40.526414
9	12	FILE_DOWNLOADED	{"fileId": 6, "shareId": "4", "filename": "Non_Personal_Data.txt"}	6	2026-05-22 18:09:54.082306
10	12	FILE_UPLOADED	{"size": 166951, "type": ".jpg", "filename": "PHOTO-2026-05-21-22-41-11.jpg"}	7	2026-05-22 18:14:13.896397
11	11	FILE_UPLOADED	{"size": 3405, "type": ".txt", "filename": "DPB_Breach_Notification.txt"}	8	2026-05-22 21:52:05.005425
\.


--
-- Data for Name: breach_alerts; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.breach_alerts (id, title, severity, description, affected_records, detected_at, status, created_at) FROM stdin;
1	Unauthorized Data Export	critical	Employee exported customer database without authorization	1500	2026-05-18 20:48:54.346962	open	2026-05-18 20:48:54.346962
2	Unauthorized Data Export	medium	Unauthorized Data Export	2000	2026-05-18 20:56:57.184602	open	2026-05-18 20:56:57.184602
3	Unauthorize access	medium	Unauthorize access	300	2026-05-22 21:25:07.027799	open	2026-05-22 21:25:07.027799
\.


--
-- Data for Name: compliance_items; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.compliance_items (id, title, category, mandatory, completed, completed_date, created_at) FROM stdin;
1	Obtain valid consent from users	Consent Management	t	f	2026-05-23 08:39:27.173826	2026-05-18 20:19:55.933066
2	Create privacy notice in 22 languages	Transparency	t	f	2026-05-23 08:39:29.228924	2026-05-18 20:19:55.933066
3	Appoint Data Protection Officer (DPO)	Governance	t	f	2026-05-23 08:39:30.495115	2026-05-18 20:19:55.933066
4	Conduct Data Impact Assessment (DPIA)	Risk Management	t	f	2026-05-23 08:39:32.319171	2026-05-18 20:19:55.933066
5	Establish data retention policy	Data Governance	t	f	2026-05-23 08:39:34.437581	2026-05-18 20:19:55.933066
14	Establish data deletion policy	Data Governance	t	f	2026-05-23 08:39:36.172104	2026-05-18 20:19:55.933066
15	Setup cross-border data transfer controls	Data Governance	t	f	2026-05-23 08:39:37.251213	2026-05-18 20:19:55.933066
17	Implement data minimization	Data Governance	t	f	2026-05-23 08:39:38.155246	2026-05-18 20:19:55.933066
6	Create Data Processing Agreements (DPA)	Vendor Management	t	f	2026-05-23 08:39:40.099649	2026-05-18 20:19:55.933066
7	Train staff on DPDP compliance	Training	t	f	2026-05-23 08:39:41.315198	2026-05-18 20:19:55.933066
8	Setup breach notification process	Incident Response	t	f	2026-05-23 08:39:43.833165	2026-05-18 20:19:55.933066
11	Encrypt sensitive data	Security	t	f	2026-05-23 08:39:46.505074	2026-05-18 20:19:55.933066
12	Setup audit logging	Monitoring	t	f	2026-05-23 08:39:48.195297	2026-05-18 20:19:55.933066
10	Implement access controls	Security	t	f	2026-05-23 08:39:49.28197	2026-05-18 20:19:55.933066
20	Maintain compliance records	Documentation	t	f	2026-05-23 08:39:50.295223	2026-05-18 20:19:55.933066
16	Document lawful basis for processing	Documentation	t	f	2026-05-23 08:39:51.351794	2026-05-18 20:19:55.933066
9	Document personal data processing	Documentation	t	f	2026-05-23 08:39:52.216493	2026-05-18 20:19:55.933066
13	Create data subject rights procedure	Rights Management	t	f	2026-05-23 08:39:54.738991	2026-05-18 20:19:55.933066
18	Create privacy by design policy	Design	t	f	2026-05-23 08:39:56.006193	2026-05-18 20:19:55.933066
19	Setup complaints procedure	Complaints	t	f	2026-05-23 08:39:56.90586	2026-05-18 20:19:55.933066
\.


--
-- Data for Name: database_scan_results; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.database_scan_results (id, user_id, db_type, db_name, table_name, column_name, data_type, is_pii, pii_classification, scanned_at) FROM stdin;
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.departments (id, name, description, created_at, head_email) FROM stdin;
9	IT	Information Technology	2026-05-22 19:29:39.490541	\N
10	Finance	Finance & Accounts	2026-05-22 19:29:39.490541	\N
11	HR	Human Resources	2026-05-22 19:29:39.490541	\N
12	Legal	Legal Department	2026-05-22 19:29:39.490541	\N
\.


--
-- Data for Name: discovery_results; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.discovery_results (id, user_id, scan_type, results, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.employees (id, emp_name, emp_id, salary) FROM stdin;
1	Alice Johnson	EMP001	50000.00
2	Bob Wilson	EMP002	60000.00
\.


--
-- Data for Name: external_data_sources; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.external_data_sources (id, user_id, name, type, config, last_scanned, created_at) FROM stdin;
\.


--
-- Data for Name: file_downloads; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.file_downloads (id, file_share_id, downloaded_by, download_time, ip_address) FROM stdin;
\.


--
-- Data for Name: file_pii_detection; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.file_pii_detection (id, file_id, pii_type, detected_count, detected_values, created_at) FROM stdin;
\.


--
-- Data for Name: file_retention; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.file_retention (id, file_id, retention_days, deletion_scheduled_at, deleted_at, created_at) FROM stdin;
\.


--
-- Data for Name: file_shares; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.file_shares (id, file_id, sender_id, receiver_department_id, purpose, approval_status, approved_by, approved_at, shared_at, created_at) FROM stdin;
3	5	11	10	Personal	approved	12	2026-05-22 17:50:33.627702	\N	2026-05-22 17:50:00.742374
2	5	11	10	Personal Data	approved	12	2026-05-22 17:50:41.347787	\N	2026-05-22 17:47:19.605035
4	6	11	10	Non Personal Data	approved	12	2026-05-22 18:05:40.514212	\N	2026-05-22 18:05:11.805199
\.


--
-- Data for Name: files; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.files (id, filename, file_path, file_size, uploaded_by, department_id, file_type, created_at) FROM stdin;
5	Personal_Data.txt	C:\\dpdp-compliance-mvp\\backend\\uploads\\1779471878649-Personal_Data.txt	500	11	\N	.txt	2026-05-22 17:44:38.697486
6	Non_Personal_Data.txt	C:\\dpdp-compliance-mvp\\backend\\uploads\\1779472919342-Non_Personal_Data.txt	10	11	\N	.txt	2026-05-22 18:01:59.350712
7	PHOTO-2026-05-21-22-41-11.jpg	C:\\dpdp-compliance-mvp\\backend\\uploads\\1779473653862-PHOTO-2026-05-21-22-41-11.jpg	166951	12	\N	.jpg	2026-05-22 18:14:13.875489
8	DPB_Breach_Notification.txt	C:\\dpdp-compliance-mvp\\backend\\uploads\\1779486724930-DPB_Breach_Notification.txt	3405	11	\N	.txt	2026-05-22 21:52:04.978339
\.


--
-- Data for Name: s3_scan_results; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.s3_scan_results (id, user_id, bucket_name, object_key, file_size, file_type, has_pii, pii_types, scanned_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.users (id, username, email, password, department, role, created_at, updated_at) FROM stdin;
11	admin1	admin@example.com	$2b$10$0dl9mFW.Q0uTJqlT/EAaoOuHI04N3V7EuuRKT0tje5nfyVdZlVSgC	IT	user	2026-05-22 17:30:21.780674	2026-05-22 17:30:21.780674
12	manager1	manager1@gmail.com	$2b$10$bmAWuMa4NVO8kZf3jA/3h.5wfSvcxT0YW7jkH7egVfCaXQ4nC88H6	Finance	user	2026-05-22 17:30:53.552009	2026-05-22 17:30:53.552009
\.


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 11, true);


--
-- Name: breach_alerts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.breach_alerts_id_seq', 3, true);


--
-- Name: compliance_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.compliance_items_id_seq', 20, true);


--
-- Name: database_scan_results_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.database_scan_results_id_seq', 1, false);


--
-- Name: departments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.departments_id_seq', 12, true);


--
-- Name: discovery_results_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.discovery_results_id_seq', 1, false);


--
-- Name: employees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.employees_id_seq', 2, true);


--
-- Name: external_data_sources_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.external_data_sources_id_seq', 1, false);


--
-- Name: file_downloads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.file_downloads_id_seq', 1, false);


--
-- Name: file_pii_detection_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.file_pii_detection_id_seq', 1, false);


--
-- Name: file_retention_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.file_retention_id_seq', 1, false);


--
-- Name: file_shares_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.file_shares_id_seq', 4, true);


--
-- Name: files_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.files_id_seq', 8, true);


--
-- Name: s3_scan_results_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.s3_scan_results_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.users_id_seq', 12, true);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: breach_alerts breach_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.breach_alerts
    ADD CONSTRAINT breach_alerts_pkey PRIMARY KEY (id);


--
-- Name: compliance_items compliance_items_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.compliance_items
    ADD CONSTRAINT compliance_items_pkey PRIMARY KEY (id);


--
-- Name: database_scan_results database_scan_results_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.database_scan_results
    ADD CONSTRAINT database_scan_results_pkey PRIMARY KEY (id);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: discovery_results discovery_results_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.discovery_results
    ADD CONSTRAINT discovery_results_pkey PRIMARY KEY (id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: external_data_sources external_data_sources_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.external_data_sources
    ADD CONSTRAINT external_data_sources_pkey PRIMARY KEY (id);


--
-- Name: file_downloads file_downloads_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.file_downloads
    ADD CONSTRAINT file_downloads_pkey PRIMARY KEY (id);


--
-- Name: file_pii_detection file_pii_detection_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.file_pii_detection
    ADD CONSTRAINT file_pii_detection_pkey PRIMARY KEY (id);


--
-- Name: file_retention file_retention_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.file_retention
    ADD CONSTRAINT file_retention_pkey PRIMARY KEY (id);


--
-- Name: file_shares file_shares_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.file_shares
    ADD CONSTRAINT file_shares_pkey PRIMARY KEY (id);


--
-- Name: files files_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_pkey PRIMARY KEY (id);


--
-- Name: s3_scan_results s3_scan_results_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.s3_scan_results
    ADD CONSTRAINT s3_scan_results_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_audit_action; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_audit_action ON public.audit_logs USING btree (action);


--
-- Name: idx_audit_file; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_audit_file ON public.audit_logs USING btree (file_id);


--
-- Name: idx_audit_user; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_audit_user ON public.audit_logs USING btree (user_id);


--
-- Name: idx_db_scan_user; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_db_scan_user ON public.database_scan_results USING btree (user_id);


--
-- Name: idx_discovery_date; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_discovery_date ON public.discovery_results USING btree (created_at);


--
-- Name: idx_discovery_user; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_discovery_user ON public.discovery_results USING btree (user_id);


--
-- Name: idx_retention_scheduled; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_retention_scheduled ON public.file_retention USING btree (deletion_scheduled_at);


--
-- Name: idx_s3_user; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_s3_user ON public.s3_scan_results USING btree (user_id);


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: database_scan_results database_scan_results_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.database_scan_results
    ADD CONSTRAINT database_scan_results_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: discovery_results discovery_results_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.discovery_results
    ADD CONSTRAINT discovery_results_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: external_data_sources external_data_sources_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.external_data_sources
    ADD CONSTRAINT external_data_sources_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: file_downloads file_downloads_downloaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.file_downloads
    ADD CONSTRAINT file_downloads_downloaded_by_fkey FOREIGN KEY (downloaded_by) REFERENCES public.users(id);


--
-- Name: file_downloads file_downloads_file_share_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.file_downloads
    ADD CONSTRAINT file_downloads_file_share_id_fkey FOREIGN KEY (file_share_id) REFERENCES public.file_shares(id);


--
-- Name: file_pii_detection file_pii_detection_file_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.file_pii_detection
    ADD CONSTRAINT file_pii_detection_file_id_fkey FOREIGN KEY (file_id) REFERENCES public.files(id);


--
-- Name: file_retention file_retention_file_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.file_retention
    ADD CONSTRAINT file_retention_file_id_fkey FOREIGN KEY (file_id) REFERENCES public.files(id);


--
-- Name: file_shares file_shares_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.file_shares
    ADD CONSTRAINT file_shares_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: file_shares file_shares_file_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.file_shares
    ADD CONSTRAINT file_shares_file_id_fkey FOREIGN KEY (file_id) REFERENCES public.files(id);


--
-- Name: file_shares file_shares_receiver_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.file_shares
    ADD CONSTRAINT file_shares_receiver_department_id_fkey FOREIGN KEY (receiver_department_id) REFERENCES public.departments(id);


--
-- Name: file_shares file_shares_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.file_shares
    ADD CONSTRAINT file_shares_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- Name: files files_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: files files_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- Name: s3_scan_results s3_scan_results_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.s3_scan_results
    ADD CONSTRAINT s3_scan_results_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict YnyIN85Br4UaQ7HArLrpu3WGXboSEMLeLtBr1k1dXoG70aEPenJZTM3McmjDfDX


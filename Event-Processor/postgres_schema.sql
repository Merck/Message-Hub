-- Table Definition ----------------------------------------------

CREATE TABLE adapters (
    id SERIAL PRIMARY KEY,
    service_name character varying(128) NOT NULL,
    display_name character varying(128) NOT NULL,
    active boolean DEFAULT true
);

-- Indices -------------------------------------------------------

CREATE UNIQUE INDEX adapters_pkey ON adapters(id int4_ops);

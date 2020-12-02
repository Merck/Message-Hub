-- DDL generated by Postico 1.5.8
-- Not all database features are supported. Do not use for backup.

-- Table Definition ----------------------------------------------

CREATE TABLE events (
    id character varying(128) PRIMARY KEY,
    timestamp timestamp with time zone NOT NULL,
    client_id character varying(128) NOT NULL REFERENCES organization_clients(client_id),
    organization_id integer NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    type character varying(40),
    action character varying(128),
    source character varying(128) NOT NULL,
    status character varying(40) NOT NULL,
    xml_data text,
    json_data text
);

-- Indices -------------------------------------------------------

CREATE UNIQUE INDEX events_pkey ON events(id text_ops);
CREATE INDEX events_organization_id_index ON events(organization_id int4_ops);


-- Table Definition ----------------------------------------------

CREATE TABLE event_destinations (
    id character varying(128) PRIMARY KEY,
    event_id character varying(128) REFERENCES events(id) ON DELETE CASCADE,
    destination_name character varying(128),
    service_name character varying(128),
    status character varying(128) NOT NULL,
    timestamp timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    blockchain_response text
);

-- Indices -------------------------------------------------------

CREATE UNIQUE INDEX event_destinations_pkey ON event_destinations(id text_ops);

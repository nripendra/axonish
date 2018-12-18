-- Table: public.snaps

-- DROP TABLE public.snaps;

CREATE TABLE IF NOT EXISTS public.snaps
(
    id serial NOT NULL,
    "aggregateId" character varying(50) COLLATE pg_catalog."default" NOT NULL,
    index integer,
    "previousEventIndex" integer NOT NULL DEFAULT 0,
    payload jsonb NOT NULL,
    "aggregateType" character varying(500) COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT snaps_pkey PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_snaps
    ON public.snaps USING gin
    (payload jsonb_path_ops)
    TABLESPACE pg_default;

 CREATE INDEX IF NOT EXISTS idx_aggregateid_snaps
    ON public.snaps ("aggregateId")
    TABLESPACE pg_default;
-- EPIC05-B: Channel Runtime
-- Provider secrets MUST remain server-side; this migration stores no credentials.

BEGIN;

INSERT INTO public.commerce_channels (code, name, is_active, config)
VALUES
  ('whatsapp', 'WhatsApp', false, '{}'::jsonb),
  ('shopify', 'Shopify', false, '{}'::jsonb),
  ('etsy', 'Etsy', false, '{}'::jsonb)
ON CONFLICT (code) DO NOTHING;

CREATE OR REPLACE FUNCTION public.ingest_channel_event(
  p_channel_code text, p_external_event_id text, p_event_type text, p_payload jsonb
) RETURNS bigint LANGUAGE plpgsql SECURITY INVOKER AS $$
DECLARE v_channel_id bigint; v_event_id bigint;
BEGIN
  IF nullif(trim(p_channel_code),'') IS NULL OR nullif(trim(p_external_event_id),'') IS NULL OR nullif(trim(p_event_type),'') IS NULL THEN
    RAISE EXCEPTION 'channel_code, external_event_id and event_type are required';
  END IF;
  SELECT id INTO v_channel_id FROM public.commerce_channels
   WHERE code=lower(trim(p_channel_code)) AND is_active=true;
  IF v_channel_id IS NULL THEN RAISE EXCEPTION 'channel is not active: %',p_channel_code; END IF;
  INSERT INTO public.channel_events(channel_id,external_event_id,event_type,payload)
  VALUES(v_channel_id,trim(p_external_event_id),trim(p_event_type),coalesce(p_payload,'{}'::jsonb))
  ON CONFLICT(channel_id,external_event_id) DO UPDATE SET payload=EXCLUDED.payload,event_type=EXCLUDED.event_type
  RETURNING id INTO v_event_id;
  RETURN v_event_id;
END; $$;

CREATE OR REPLACE FUNCTION public.process_channel_order(
  p_channel_code text, p_external_order_id text, p_payload jsonb
) RETURNS bigint LANGUAGE plpgsql SECURITY INVOKER AS $$
DECLARE
  v_channel_id bigint; v_channel_order_id bigint; v_order_id bigint;
  v_order_number text; v_currency text; v_items jsonb;
BEGIN
  IF nullif(trim(p_channel_code),'') IS NULL OR nullif(trim(p_external_order_id),'') IS NULL THEN RAISE EXCEPTION 'channel_code and external_order_id are required'; END IF;
  IF jsonb_typeof(p_payload) <> 'object' THEN RAISE EXCEPTION 'payload must be a JSON object'; END IF;
  SELECT id INTO v_channel_id FROM public.commerce_channels WHERE code=lower(trim(p_channel_code)) AND is_active=true;
  IF v_channel_id IS NULL THEN RAISE EXCEPTION 'channel is not active: %',p_channel_code; END IF;
  INSERT INTO public.channel_orders(channel_id,external_order_id,payload)
  VALUES(v_channel_id,trim(p_external_order_id),p_payload)
  ON CONFLICT(channel_id,external_order_id) DO UPDATE SET payload=EXCLUDED.payload,updated_at=now()
  RETURNING id,order_id INTO v_channel_order_id,v_order_id;
  IF v_order_id IS NOT NULL THEN
    UPDATE public.channel_orders SET status='processed',processed_at=coalesce(processed_at,now()),last_error=NULL,updated_at=now() WHERE id=v_channel_order_id;
    RETURN v_order_id;
  END IF;
  v_order_number:=nullif(trim(p_payload->>'order_number'),'');
  v_currency:=coalesce(nullif(trim(p_payload->>'currency'),''),'EGP');
  v_items:=p_payload->'items';
  IF v_order_number IS NULL THEN RAISE EXCEPTION 'payload.order_number is required'; END IF;
  IF jsonb_typeof(v_items) <> 'array' OR jsonb_array_length(v_items)=0 THEN RAISE EXCEPTION 'payload.items must be a non-empty array'; END IF;
  BEGIN
    v_order_id:=public.create_commerce_order(v_order_number,lower(trim(p_channel_code)),v_currency,v_items);
    UPDATE public.channel_orders SET order_id=v_order_id,status='processed',processed_at=now(),last_error=NULL,updated_at=now() WHERE id=v_channel_order_id;
    RETURN v_order_id;
  EXCEPTION WHEN OTHERS THEN
    UPDATE public.channel_orders SET status='failed',last_error=SQLERRM,updated_at=now() WHERE id=v_channel_order_id;
    RETURN NULL;
  END;
END; $$;

REVOKE ALL ON FUNCTION public.ingest_channel_event(text,text,text,jsonb) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.process_channel_order(text,text,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.ingest_channel_event(text,text,text,jsonb) TO authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.process_channel_order(text,text,jsonb) TO authenticated,service_role;

COMMIT;

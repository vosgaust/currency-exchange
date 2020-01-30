Create or replace function get_random_id(length integer) returns text as
$$
declare
  result text := 'TR';
begin
  if length < 0 then
    raise exception 'Given length cannot be less than 0';
  end if;
  result := result || upper(substring(md5(random()::text), 1, length));
  return result;
end;
$$ language plpgsql;


CREATE TABLE trades (
  id text DEFAULT get_random_id(7) PRIMARY KEY CHECK (id ~ '^TR[0-9A-Z]+$' ),
  sell_currency CHAR(3),
  sell_amount NUMERIC(11, 2),
  buy_currency CHAR(3),
  buy_amount NUMERIC(11, 2),
  rate NUMERIC(8, 4),
  date_booked TIMESTAMP
)
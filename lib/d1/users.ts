import type { D1 } from './db';

/**
 * Registered accounts — counted from the users table, not from events.
 *
 * Everything else in the data room is computed from calculation events, which
 * can only ever say "what share of calculations came from someone signed in".
 * That is not the same question as "how many people have an account", and it
 * cannot answer it.
 *
 * Owner and test accounts are removed here, the same way they are removed from
 * every other figure in the room.
 *
 * ⚠️ `users.last_login` is written only when someone actually authenticates
 * (lib/auth/core.ts), and sessions are long-lived — a person who comes back
 * next month is not asked to sign in again, so the column barely moves. It
 * showed 2 returning users on 2026-09-22 while the honest count was 10. Do not
 * use it for retention. `repeat` below counts accounts that saved a calculation
 * on two or more different days, which is the signal the whole longitudinal
 * idea rests on.
 */
export async function calcUsers(d: D1) {
  const one = async <T>(sql: string) => (await d.prepare(sql).first<T>()) as T;
  const many = async (sql: string) => (await d.prepare(sql).all<{ k: string; n: number }>()).results;
  const live = 'select * from users where id not in (select user_id from excluded_users)';

  const totals = await one<{ total: number; new_7d: number; new_30d: number; activated: number; repeat: number; excluded: number }>(`
    with u as (${live})
    select (select count(*) from u) total,
           (select count(*) from u where created_at >= datetime('now','-7 day'))  new_7d,
           (select count(*) from u where created_at >= datetime('now','-30 day')) new_30d,
           (select count(*) from u where id in (select user_id from calculation_history)) activated,
           (select count(*) from (select user_id from calculation_history
              where user_id in (select id from u)
              group by user_id having count(distinct substr(created_at,1,10)) > 1)) repeat,
           (select count(*) from excluded_users) excluded`);

  return {
    ...totals,
    by_provider: await many(`select coalesce(provider,'unknown') k, count(*) n from (${live}) group by 1 order by n desc`),
    by_saves: await many(`select case when c = 0 then '0' when c = 1 then '1' when c <= 4 then '2-4' else '5+' end k,
        count(*) n from (select u.id, (select count(*) from calculation_history h where h.user_id = u.id) c from (${live}) u)
        group by 1 order by case k when '0' then 0 when '1' then 1 when '2-4' then 2 else 3 end`),
    by_signup_day: await many(`select substr(created_at,1,10) k, count(*) n from (${live})
        where created_at >= datetime('now','-60 day') group by 1 order by k`),
  };
}

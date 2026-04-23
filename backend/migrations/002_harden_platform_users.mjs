function getIssueDescription(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export async function up(sql) {
  const [
    missingCpfRows,
    invalidCpfRows,
    duplicateCpfRows,
    duplicateEmailRows,
    invalidPhoneRows,
  ] = await Promise.all([
    sql`
      select count(*)::int as count
      from platform_users
      where cpf is null
        or btrim(cpf) = ''
    `,
    sql`
      select count(*)::int as count
      from platform_users
      where cpf is not null
        and btrim(cpf) <> ''
        and not platform_is_valid_cpf(cpf)
    `,
    sql`
      select count(*)::int as count
      from (
        select regexp_replace(cpf, '\\D', '', 'g')
        from platform_users
        where cpf is not null
          and btrim(cpf) <> ''
        group by 1
        having count(*) > 1
      ) as duplicated_cpfs
    `,
    sql`
      select count(*)::int as count
      from (
        select lower(btrim(email))
        from platform_users
        group by 1
        having count(*) > 1
      ) as duplicated_emails
    `,
    sql`
      select count(*)::int as count
      from platform_users
      where phone is null
        or regexp_replace(phone, '\\D', '', 'g') !~ '^[0-9]{10,13}$'
    `,
  ]);

  const issues = [];
  const missingCpfCount = missingCpfRows[0]?.count ?? 0;
  const invalidCpfCount = invalidCpfRows[0]?.count ?? 0;
  const duplicateCpfCount = duplicateCpfRows[0]?.count ?? 0;
  const duplicateEmailCount = duplicateEmailRows[0]?.count ?? 0;
  const invalidPhoneCount = invalidPhoneRows[0]?.count ?? 0;

  if (missingCpfCount > 0) {
    issues.push(
      getIssueDescription(
        missingCpfCount,
        "usuário legado sem CPF",
        "usuários legados sem CPF",
      ),
    );
  }

  if (invalidCpfCount > 0) {
    issues.push(
      getIssueDescription(
        invalidCpfCount,
        "usuário legado com CPF inválido",
        "usuários legados com CPF inválido",
      ),
    );
  }

  if (duplicateCpfCount > 0) {
    issues.push(
      getIssueDescription(
        duplicateCpfCount,
        "CPF duplicado após normalização",
        "CPFs duplicados após normalização",
      ),
    );
  }

  if (duplicateEmailCount > 0) {
    issues.push(
      getIssueDescription(
        duplicateEmailCount,
        "e-mail duplicado após normalização",
        "e-mails duplicados após normalização",
      ),
    );
  }

  if (invalidPhoneCount > 0) {
    issues.push(
      getIssueDescription(
        invalidPhoneCount,
        "usuário legado com telefone inválido",
        "usuários legados com telefone inválido",
      ),
    );
  }

  if (issues.length > 0) {
    throw new Error(
      `A tabela platform_users contém inconsistências legadas: ${issues.join(", ")}. Corrija esses registros antes de concluir as migrações.`,
    );
  }

  await sql`
    update platform_users
    set
      name = regexp_replace(btrim(name), '\\s+', ' ', 'g'),
      email = lower(btrim(email)),
      cpf = regexp_replace(cpf, '\\D', '', 'g'),
      phone = regexp_replace(phone, '\\D', '', 'g'),
      city = nullif(regexp_replace(btrim(coalesce(city, '')), '\\s+', ' ', 'g'), '')
  `;

  await sql`
    drop index if exists platform_users_cpf_idx
  `;

  await sql`
    create unique index if not exists platform_users_cpf_idx
      on platform_users (cpf)
  `;

  await sql`
    alter table platform_users
      alter column cpf set not null
  `;

  await sql`
    do $$
    begin
      if not exists (
        select 1
        from pg_constraint
        where conname = 'platform_users_email_normalized_check'
      ) then
        alter table platform_users
          add constraint platform_users_email_normalized_check
          check (email = lower(btrim(email)));
      end if;

      if not exists (
        select 1
        from pg_constraint
        where conname = 'platform_users_cpf_digits_check'
      ) then
        alter table platform_users
          add constraint platform_users_cpf_digits_check
          check (cpf ~ '^[0-9]{11}$');
      end if;

      if not exists (
        select 1
        from pg_constraint
        where conname = 'platform_users_cpf_valid_check'
      ) then
        alter table platform_users
          add constraint platform_users_cpf_valid_check
          check (platform_is_valid_cpf(cpf));
      end if;

      if not exists (
        select 1
        from pg_constraint
        where conname = 'platform_users_phone_digits_check'
      ) then
        alter table platform_users
          add constraint platform_users_phone_digits_check
          check (phone ~ '^[0-9]{10,13}$');
      end if;
    end $$;
  `;

  await sql`
    alter table platform_users
      validate constraint platform_users_email_normalized_check
  `;

  await sql`
    alter table platform_users
      validate constraint platform_users_cpf_digits_check
  `;

  await sql`
    alter table platform_users
      validate constraint platform_users_cpf_valid_check
  `;

  await sql`
    alter table platform_users
      validate constraint platform_users_phone_digits_check
  `;
}

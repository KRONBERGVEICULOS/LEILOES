const CPF_LENGTH = 11;

export function normalizeCpf(value: string) {
  return value.replace(/\D/g, "").slice(0, CPF_LENGTH);
}

export function formatCpf(value: string) {
  const digits = normalizeCpf(value);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 6) {
    return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  }

  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function calculateCpfCheckDigit(baseDigits: string) {
  const total = baseDigits
    .split("")
    .reduce((sum, digit, index) => sum + Number(digit) * (baseDigits.length + 1 - index), 0);
  const remainder = (total * 10) % 11;

  return remainder === 10 ? 0 : remainder;
}

export function isValidCpf(value: string) {
  const cpf = normalizeCpf(value);

  if (cpf.length !== CPF_LENGTH) {
    return false;
  }

  if (/^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  const baseDigits = cpf.slice(0, 9);
  const firstCheckDigit = calculateCpfCheckDigit(baseDigits);
  const secondCheckDigit = calculateCpfCheckDigit(`${baseDigits}${firstCheckDigit}`);

  return cpf === `${baseDigits}${firstCheckDigit}${secondCheckDigit}`;
}

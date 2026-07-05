const RWANDA_PREFIX = '+250';

export function formatPhone(digits) {
    const cleaned = digits.replace(/\D/g, '').slice(0, 9);
    return `${RWANDA_PREFIX}${cleaned}`;
}

export function isValidPhone(phone) {
    return /^\+250[0-9]{9}$/.test(phone);
}

export function maskPhone(phone) {
    if (!phone || phone.length < 8) {
        return phone;
    }

    return `${phone.slice(0, 7)}***${phone.slice(-2)}`;
}

export { RWANDA_PREFIX };


export function getAccessToken(): string {
    const token = localStorage.getItem("x-access-token") ?? "";
    return token;
}


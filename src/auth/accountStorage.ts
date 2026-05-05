export const ACCOUNT_STORAGE_KEY = "ticketrush.account";
export const ACCOUNT_CHANGE_EVENT = "ticketrush-account-change";

export type StoredAccount = {
	displayName: string;
	email?: string;
	avatarUrl?: string;
};

function canUseStorage() {
	return typeof window !== "undefined";
}

export function readStoredAccount() {
	if (!canUseStorage()) {
		return null;
	}

	try {
		const value = window.localStorage.getItem(ACCOUNT_STORAGE_KEY);
		if (!value) {
			return null;
		}

		return JSON.parse(value) as StoredAccount;
	} catch {
		return null;
	}
}

export function writeStoredAccount(account: StoredAccount) {
	if (!canUseStorage()) {
		return;
	}

	window.localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(account));
	window.dispatchEvent(new Event(ACCOUNT_CHANGE_EVENT));
}

export function clearStoredAccount() {
	if (!canUseStorage()) {
		return;
	}

	window.localStorage.removeItem(ACCOUNT_STORAGE_KEY);
	window.dispatchEvent(new Event(ACCOUNT_CHANGE_EVENT));
}
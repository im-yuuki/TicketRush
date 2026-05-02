import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Card, Checkbox, Input } from "@heroui/react";
import { Link } from "react-router";

export default function Register() {
	const { t } = useTranslation();
	const [displayName, setDisplayName] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
	const [dob, setDob] = useState("");
	const [address, setAddress] = useState("");
	const [acceptTos, setAcceptTos] = useState(false);

	const confirmPasswordMismatch =
		confirmPasswordTouched && confirmPassword.length > 0 && confirmPassword !== password;

	const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		console.log("Register attempt:", {
			displayName,
			phoneNumber,
			email,
			password,
			confirmPassword,
			dob,
			address,
			acceptTos,
		});
		// TODO: Connect to auth API
	};

	return (
		<div className="flex min-h-dvh flex-col items-center justify-center px-4 py-8 pt-24">
			<Card className="w-full max-w-md">
				<Card.Header className="flex flex-col gap-3 border-b border-border pb-4">
					<h1 className="text-2xl font-bold">{t("auth.register", "Register")}</h1>
					<p className="text-sm text-muted">
						{t("auth.haveAccount", "Already have an account?")}
						<Link to="/login" className="ml-1 text-accent hover:underline">
							{t("auth.signInHere", "Sign in here")}
						</Link>
					</p>
				</Card.Header>

				<Card.Content className="gap-4">
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<label className="block text-sm font-bold">{t("auth.displayName", "Display name")}</label>
							<Input
								type="text"
								placeholder="Your name"
								value={displayName}
								onInput={(e) => setDisplayName(e.currentTarget.value)}
								className="w-full rounded-md border border-border transition-colors hover:border-accent focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
								required
							/>
						</div>

						<div className="space-y-2">
							<label className="block text-sm font-bold">{t("auth.phoneNumber", "Phone number")}</label>
							<Input
								type="tel"
								placeholder="0123456789"
								value={phoneNumber}
								onInput={(e) => setPhoneNumber(e.currentTarget.value)}
								className="w-full rounded-md border border-border transition-colors hover:border-accent focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
								required
							/>
						</div>

						<div className="space-y-2">
							<label className="block text-sm font-bold">{t("auth.email", "Email")}</label>
							<Input
								type="email"
								placeholder="you@example.com"
								value={email}
								onInput={(e) => setEmail(e.currentTarget.value)}
								className="w-full rounded-md border border-border transition-colors hover:border-accent focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
								required
							/>
						</div>

						<div className="space-y-2">
							<label className="block text-sm font-bold">{t("auth.password", "Password")}</label>
							<Input
								type="password"
								placeholder="••••••••"
								value={password}
								onInput={(e) => setPassword(e.currentTarget.value)}
								className="w-full rounded-md border border-border transition-colors hover:border-accent focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
								required
							/>
						</div>

						<div className="space-y-2">
							<label className="block text-sm font-bold">{t("auth.confirmPassword", "Confirm Password")}</label>
							<Input
								type="password"
								placeholder="••••••••"
								value={confirmPassword}
								onInput={(e) => setConfirmPassword(e.currentTarget.value)}
								onBlur={() => setConfirmPasswordTouched(true)}
								className={`w-full rounded-md border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
									confirmPasswordMismatch
										? "border-danger hover:border-danger focus:border-danger"
										: "border-border hover:border-accent focus:border-accent"
								}`}
								required
							/>
							{confirmPasswordMismatch && (
								<p className="text-xs text-danger">Passwords do not match.</p>
							)}
						</div>

						<div className="space-y-2">
							<label className="block text-sm font-bold">{t("auth.dob", "D.O.B")}</label>
							<Input
								type="date"
								value={dob}
								onInput={(e) => setDob(e.currentTarget.value)}
								className="w-full rounded-md border border-border transition-colors hover:border-accent focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
								required
							/>
						</div>

						<div className="space-y-2">
							<label className="block text-sm font-bold">{t("auth.address", "Address")}</label>
							<Input
								type="text"
								placeholder="Your address"
								value={address}
								onInput={(e) => setAddress(e.currentTarget.value)}
								className="w-full rounded-md border border-border transition-colors hover:border-accent focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
								required
							/>
						</div>

						<div className="pt-1">
							<Checkbox
								isSelected={acceptTos}
								onChange={setAcceptTos}
								className="items-start"
							>
								<Checkbox.Control>
									<Checkbox.Indicator />
								</Checkbox.Control>
								<Checkbox.Content>
									<span className="text-xs leading-5 text-muted">
										{t("auth.acceptTosPrefix", "I agree to the")}{" "}
										<Link to="/terms" className="text-accent hover:underline">
											{t("auth.acceptTosLink", "Terms of Service")}
										</Link>
									</span>
								</Checkbox.Content>
							</Checkbox>
						</div>

						<Button
							type="submit"
							className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
							size="lg"
							isDisabled={!acceptTos}
						>
							{t("auth.registerButton", "Register")}
						</Button>
					</form>
				</Card.Content>
			</Card>
		</div>
	);
}
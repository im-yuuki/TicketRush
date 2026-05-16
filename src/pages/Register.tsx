import { useState, type Key } from "react";
import { useTranslation } from "react-i18next";
import { Button, Card, Checkbox, Dropdown, Input } from "@heroui/react";
import { Link, useNavigate } from "react-router";
import { registerUser } from "../api/auth";

export default function Register() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [displayName, setDisplayName] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [gender, setGender] = useState<"male" | "female" | "other" | null>(null);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
	const [dob, setDob] = useState("");
	const [address, setAddress] = useState("");
	const [acceptTos, setAcceptTos] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);

	const confirmPasswordMismatch =
		confirmPassword.length > 0 && confirmPassword !== password;
	const showConfirmPasswordMismatch = confirmPasswordTouched && confirmPasswordMismatch;

	function handleGenderChange(key: Key) {
		const v = String(key) as "male" | "female" | "other" | "";
		setGender(v === "" ? null : v);
	}

	const genderLabel =
		gender === "male"
			? t("auth.genderMale", "Male")
			: gender === "female"
				? t("auth.genderFemale", "Female")
				: gender === "other"
					? t("auth.genderOther", "Other")
					: t("auth.selectGender", "Select gender");

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();

		setSubmitError(null);
		setIsSubmitting(true);

		try {
		await registerUser({
			name: displayName,
			email,
			password,
			birthDate: dob,
			gender:gender ?? "other",
		});

			navigate(`/otp`);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Register failed";
			setSubmitError(message);
		} finally {
			setIsSubmitting(false);
		}
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
						{submitError && <p className="text-sm text-danger">{submitError}</p>}

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
							<label className="block text-sm font-bold">{t("auth.gender", "Gender")}</label>
							<Dropdown>
								<Dropdown.Trigger className="w-full">
									<Button
										variant="tertiary"
										size="lg"
										className="w-full justify-between rounded-md border border-border bg-transparent text-foreground font-normal transition-colors hover:border-accent focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
									>
										<span className={gender ? "" : "text-muted"}>{genderLabel}</span>
									</Button>
								</Dropdown.Trigger>
								<Dropdown.Popover className="w-[var(--trigger-width)] max-w-full">
									<Dropdown.Menu
										className="rounded-md border border-border bg-surface-secondary text-surface-foreground"
										selectionMode="single"
										selectedKeys={new Set([gender ?? ""])}
										onAction={handleGenderChange}
									>
										<Dropdown.Item id="" key="" className="font-normal" textValue={t("auth.selectGender", "Select gender")}>
											{t("auth.selectGender", "Select gender")}
										</Dropdown.Item>
										<Dropdown.Item id="male" key="male" className="font-normal" textValue={t("auth.genderMale", "Male")}>
											{t("auth.genderMale", "Male")}
										</Dropdown.Item>
										<Dropdown.Item id="female" key="female" className="font-normal" textValue={t("auth.genderFemale", "Female")}>
											{t("auth.genderFemale", "Female")}
										</Dropdown.Item>
										<Dropdown.Item id="other" key="other" className="font-normal" textValue={t("auth.genderOther", "Other")}>
											{t("auth.genderOther", "Other")}
										</Dropdown.Item>
									</Dropdown.Menu>
								</Dropdown.Popover>
							</Dropdown>
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
								onInput={(e) => {
									setConfirmPassword(e.currentTarget.value);
									setConfirmPasswordTouched(true);
								}}
								onBlur={() => setConfirmPasswordTouched(true)}
								className={`w-full rounded-md border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
									showConfirmPasswordMismatch
										? "border-danger hover:border-danger focus:border-danger"
										: "border-border hover:border-accent focus:border-accent"
								}`}
								required
							/>
							{showConfirmPasswordMismatch && (
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
							isDisabled={!acceptTos || confirmPasswordMismatch || confirmPassword.length === 0 || isSubmitting}
						>
							{t("auth.registerButton", "Register")}
						</Button>
					</form>
				</Card.Content>
			</Card>
		</div>
	);
}
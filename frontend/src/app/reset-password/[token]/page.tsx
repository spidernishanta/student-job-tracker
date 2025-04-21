import ResetPassword from "./ResetPassword";

export default function ResetPasswordPage({
  params,
}: {
  params: { token: string };
}) {
  return <ResetPassword token={params.token} />;
}

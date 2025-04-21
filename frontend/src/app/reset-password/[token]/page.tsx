"use client";

import ResetPassword from "./ResetPassword";
import { useParams } from 'next/navigation';

export default function ResetPasswordPage() {
  const params = useParams();
  const token = Array.isArray(params.token) ? params.token[0] : params.token ?? '';

  return <ResetPassword token={token} />;
}

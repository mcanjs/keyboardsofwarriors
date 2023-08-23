import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer self-end footer-center p-10 bg-base-200 text-base-content rounded">
      <div className="grid grid-flow-col gap-4">
        <Link href="/" className="link link-hover">
          Home
        </Link>
        <Link href="/login" className="link link-hover">
          Login
        </Link>
        <Link href="/signup" className="link link-hover">
          Sign Up
        </Link>
        <Link href="/forgot-password" className="link link-hover">
          Forgot Password
        </Link>
      </div>

      <div>
        <p>Copyright © 2023 - All right reserved by Keyboards Of Warriors</p>
      </div>
    </footer>
  );
}

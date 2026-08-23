import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="section grid min-h-[50vh] place-items-center">
      <div className="card max-w-lg p-6 text-center">
        <h1 className="text-3xl font-black">Page not found</h1>
        <p className="mt-2 text-slate-600">This route is not part of the CrowdSense AI workspace.</p>
        <Link to="/" className="btn-primary mt-5">Go home</Link>
      </div>
    </section>
  );
}

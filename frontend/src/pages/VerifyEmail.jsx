export default function VerifyEmail() {
    return (
      <main className="min-h-screen flex items-center justify-center text-center bg-[#0c0c0c] text-white p-6">
        <section>
          <h1 className="text-2xl font-bold mb-4 text-[#1abc9c]">Verify Your Email</h1>
          <p className="text-lg">We've sent a verification link to your email.</p>
          <p className="text-sm mt-2 text-gray-400">
            Please verify your account before proceeding.
          </p>
        </section>
      </main>
    );
  }
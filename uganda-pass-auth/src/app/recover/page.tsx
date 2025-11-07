import { RecoverForm } from "@/components/auth/recover-form";

export default function RecoverPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <RecoverForm />
      </main>
    </div>
  )
}

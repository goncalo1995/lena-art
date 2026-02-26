import { DeleteSubscriberButton } from "@/components/admin-delete-buttons"
import { getSubscribers, getSubscribersCount } from "@/lib/data"

export default async function AdminSubscribersPage() {
  const [subscribers, subscribersCount] = await Promise.all([
    getSubscribers(1000),
    getSubscribersCount(),
  ])

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-8">
        <h1 className="font-serif text-2xl text-foreground">{subscribersCount} Subscritores</h1>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Nome
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">
                Email
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">
                Desde
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {subscribers.map((subscriber) => (
              <tr key={subscriber.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 text-foreground">
                  <span className="font-medium">{subscriber.name}</span>
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                  {subscriber.email}
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                  {subscriber.subscribed_at ? new Date(subscriber.subscribed_at).toLocaleDateString("pt-PT") : "N/A"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  <DeleteSubscriberButton id={subscriber.id} email={subscriber.email} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {subscribers.length === 0 && (
          <p className="py-12 text-center text-muted-foreground">
            Ainda não há subscritores.
          </p>
        )}
      </div>
    </div>
  )
}

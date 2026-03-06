import { getSubscribers } from "@/lib/data"

export async function GET() {
  try {
    const subscribers = await getSubscribers(10000) // Get all subscribers
    
    // Create CSV content
    const csvHeaders = ['ID', 'Name', 'Email', 'Subscribed At']
    const csvRows = subscribers.map(subscriber => [
      subscriber.id,
      `"${subscriber.name.replace(/"/g, '""')}"`, // Escape quotes in names
      subscriber.email,
      subscriber.subscribed_at ? new Date(subscriber.subscribed_at).toISOString() : ''
    ])
    
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n')
    
    // Return response with CSV file
    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="subscribers-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Error exporting subscribers:', error)
    return new Response('Error exporting subscribers', { status: 500 })
  }
}

import { Card, CardContent } from './components/ui/card'
import { Button } from './components/ui/button'

export default function GuidedSystemPlaceholder({ onBack }: { onBack: () => void }) {
  return (
    <div className="p-6 space-y-4">
      <Button variant="outline" onClick={onBack}>
        Zurück
      </Button>
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-2">Geführter Dialog - Systemanlage</h2>
          <p className="text-sm text-gray-600">Dieser Bereich wird noch entwickelt.</p>
        </CardContent>
      </Card>
    </div>
  )
}

import ManualForm from './ManualForm'
import { Button } from './components/ui/button'

export default function ManualSystemFormPage({ onBack }: { onBack: () => void }) {
  return (
    <div>
      <div className="p-4">
        <Button variant="outline" onClick={onBack}>
          Zurück
        </Button>
      </div>
      <ManualForm />
    </div>
  )
}

// The public About page. The text is carried over from v1 unchanged.
// Exists so reviewers can learn who built this without logging in.
import { Card } from '../../components/Card'
import { TopBar } from '../../components/TopBar'
import { ReviewNote } from '../../components/ReviewNote'

export function AboutScreen() {
  return (
    <div className="min-h-dvh">
      <TopBar />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <Card>
          <h1 className="text-3xl mb-4">About</h1>
          {/* TODO(Nevin): paste the About me text from safari-njema-design-reference.html here, unchanged. */}
          <p className="text-muted">
            Safari Njema is a travel companion for Kenya built by Nevin Dabrah. The About me text from the
            design reference goes here once the file is added to the repo.
          </p>
        </Card>
        <ReviewNote />
      </main>
    </div>
  )
}

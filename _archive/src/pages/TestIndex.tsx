export default function TestIndex() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">NirogCare</h1>
        <p className="text-xl text-muted-foreground mb-8">Healthcare Platform</p>
        <div className="space-y-4">
          <div className="p-4 bg-card rounded-lg border">
            <h2 className="text-lg font-semibold mb-2">✅ Application is Working!</h2>
            <p className="text-muted-foreground">The basic setup is successful.</p>
          </div>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Next Steps:</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>✅ Build successful</li>
              <li>✅ Development server running</li>
              <li>✅ Basic components loading</li>
              <li>🔧 Check individual components if needed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

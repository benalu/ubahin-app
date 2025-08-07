const items = [
  {
    title: 'Images',
    formats: ['png', 'jpg', 'gif', 'webp', 'heic'],
    icon: '🖼️',
  },
  {
    title: 'Audio',
    formats: ['mp3', 'wav', 'flac', 'aac'],
    icon: '🎵',
  },
  {
    title: 'Documents',
    formats: ['pdf', 'docx', 'md', 'html', 'rtf'],
    icon: '📄',
  },
  {
    title: 'Video',
    formats: ['mp4', 'webm', 'avi', 'mov'],
    icon: '🎬',
  },
];

export default function SupportedFormats() {
  return (
    <section className="px-4">
      <h2 className="text-center text-2xl font-bold mb-10">We support all major formats</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {items.map((item) => (
          <div key={item.title} className="bg-muted border rounded-xl p-5 text-center">
            <div className="text-3xl mb-2">{item.icon}</div>
            <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
            <p className="text-muted-foreground text-sm">
              {item.formats.join(', ')}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

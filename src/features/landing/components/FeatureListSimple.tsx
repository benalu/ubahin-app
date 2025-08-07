import { toolCategories } from "@/features/landing/data/tools";

export default function FeatureListSimple() {
  return (
    <div className="grid sm:hidden gap-3 grid-cols-2 px-4">
      {toolCategories.flatMap((category) =>
        category.features.map((feature, i) => (
          <div
            key={`${category.title}-${i}`}
            className="bg-muted text-sm rounded text-center px-3 py-2 shadow-sm"
          >
            {feature}
          </div>
        ))
      )}
    </div>
  );
}

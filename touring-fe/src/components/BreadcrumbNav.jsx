import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb"

export default function BreadcrumbNav({ items = [] }) {
  return (
    <Breadcrumb>
      <BreadcrumbList className="flex items-center space-x-1 md:space-x-2">
        {items.map((item, index) => (
          <BreadcrumbItem key={index} className="relative group">
            {item.href ? (
              <BreadcrumbLink
                href={item.href}
                className="relative px-1 hover:text-black-700 transition-all duration-300 ease-out group-hover:scale-105"
              >
                {/* Giữ màu chữ xám, chỉ animate underline */}
                <span className="relative z-10">{item.label}</span>
                <span className="absolute left-0 bottom-0 h-0.5 w-0 bg-black-500 transition-all duration-300 ease-out group-hover:w-full" />
              </BreadcrumbLink>
            ) : (
              <BreadcrumbPage className="px-1 font-semibold text-gray-900">
                {item.label}
              </BreadcrumbPage>
            )}
            {index < items.length - 1 && (
              <BreadcrumbSeparator className="mx-1 text-gray-400" />
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

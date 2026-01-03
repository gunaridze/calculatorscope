import Link from 'next/link'

type BreadcrumbItem = {
    name: string
    href: string
}

type BreadcrumbsProps = {
    items: BreadcrumbItem[]
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <nav className="mb-4 text-sm text-gray-600">
            {items.map((item, index) => (
                <span key={item.href}>
                    {index > 0 && <span className="mx-2">/</span>}
                    {index === items.length - 1 ? (
                        <span className="text-gray-900">{item.name}</span>
                    ) : (
                        <Link href={item.href} className="hover:text-blue-600">
                            {item.name}
                        </Link>
                    )}
                </span>
            ))}
        </nav>
    )
}


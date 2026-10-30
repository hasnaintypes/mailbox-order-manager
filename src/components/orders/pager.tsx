import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

/** Page numbers to show: first, last, and a window around the current page. */
export function pageWindow(page: number, totalPages: number): (number | "gap")[] {
  const wanted = new Set([1, totalPages, page - 1, page, page + 1]);
  const pages = [...wanted].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  return pages.flatMap((p, index) => {
    const previous = pages[index - 1];
    return previous !== undefined && p - previous > 1 ? ["gap" as const, p] : [p];
  });
}

export function Pager({
  page,
  totalPages,
  href,
}: {
  page: number;
  totalPages: number;
  href: (page: number) => string;
}) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <Pagination className="mx-0 w-auto">
      <PaginationContent>
        {page > 1 ? (
          <PaginationItem><PaginationPrevious href={href(page - 1)} /></PaginationItem>
        ) : null}
        {pageWindow(page, totalPages).map((item, index) =>
          item === "gap" ? (
            <PaginationItem key={`gap-${index}`}><PaginationEllipsis /></PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink href={href(item)} isActive={item === page}>{item}</PaginationLink>
            </PaginationItem>
          ),
        )}
        {page < totalPages ? (
          <PaginationItem><PaginationNext href={href(page + 1)} /></PaginationItem>
        ) : null}
      </PaginationContent>
    </Pagination>
  );
}

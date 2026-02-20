import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 transition-colors overflow-hidden",
  {
    variants: {
      variant: {
        /* ── Brand ── */
        default:
          "border-transparent bg-orange-500 text-white",
        secondary:
          "border-orange-200 bg-orange-50 text-orange-700",
        outline:
          "border-orange-300 bg-transparent text-orange-700",
        destructive:
          "border-transparent bg-red-500 text-white",

        /* ── Status Trip ── */
        // Draft — abu netral
        draft:
          "border-gray-200 bg-gray-100 text-gray-600",
        // Sedang Jalan — biru
        ongoing:
          "border-blue-200 bg-blue-50 text-blue-700",
        // Selesai — hijau
        done:
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        // Aktif — hijau (sama dengan done tapi nama berbeda)
        success:
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        // Dibatalkan — merah muda
        cancelled:
          "border-red-200 bg-red-50 text-red-600",

        /* ── Kategori Tipe ── */
        // Maintenance — amber sesuai warna TAN
        maintenance:
          "border-amber-200 bg-amber-50 text-amber-700",
        // Umum — slate netral
        info:
          "border-slate-200 bg-slate-50 text-slate-600",
        // Non-aktif
        muted:
          "border-gray-200 bg-gray-50 text-gray-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
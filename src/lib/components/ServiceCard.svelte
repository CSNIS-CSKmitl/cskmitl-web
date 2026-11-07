<script lang="ts">
  import {
    ArrowUpRight,
    Server,
    Smartphone,
    Megaphone,
    CalendarDays,
    Package,
    Printer,
    NotebookTabs,
    Terminal
  } from '@lucide/svelte';

  interface Props {
    service: {
      name: string;
      description: string;
      type: string;
      status?: string;
      url?: string;
    };
  }

  let { service }: Props = $props();

  const icons: Record<string, any> = {
    Announcements: Megaphone,
    Booking: CalendarDays,
    'Borrow Item': Package,
    CSNIS: Server,
    'Android App': Smartphone,
    'Printer Server': Printer,
    JupyterHub: NotebookTabs,
    'init.d': Terminal
  };

  let Icon = $derived(icons[service.name] || Server);
</script>

<article
  class="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 transition-colors duration-150 hover:border-slate-300"
>
  <div>
    <div class="mb-4 flex items-center justify-between">
      <div class="grid size-9 place-items-center rounded-lg border border-slate-200/80 bg-slate-50 text-slate-700">
        <Icon size={18} strokeWidth={1.5} />
      </div>

      {#if service.status}
        <span class="inline-flex items-center gap-1.5 rounded-md border border-slate-200/60 bg-slate-50 px-2 py-0.5 text-xs text-slate-600">
          <span
            class="size-1.5 rounded-full {service.status === 'พร้อมใช้งาน'
              ? 'bg-emerald-600'
              : service.status === 'กำลังพัฒนา'
                ? 'bg-amber-500'
                : 'bg-rose-500'}"
          ></span>
          <span>{service.status}</span>
        </span>
      {/if}
    </div>

    <h3 class="text-base font-semibold text-slate-900">{service.name}</h3>

    <p class="mt-2 min-h-11 text-xs leading-relaxed text-slate-600 font-normal">
      {service.description}
    </p>
  </div>

  <div class="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
    <span class="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-600">
      {service.type}
    </span>

    {#if service.url}
      <a
        href={service.url}
        target="_blank"
        rel="noreferrer"
        class="inline-flex items-center gap-1 font-medium text-slate-900 transition-colors hover:text-orange-700"
      >
        <span>เปิดระบบ</span>
        <ArrowUpRight size={14} strokeWidth={1.5} />
      </a>
    {:else}
      <span class="inline-flex items-center text-slate-400">
        ไม่ได้ระบุลิงก์
      </span>
    {/if}
  </div>
</article>

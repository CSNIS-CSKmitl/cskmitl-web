<script lang="ts">
  import {
    ArrowRight,
    Server,
    Smartphone,
    Megaphone,
    CalendarDays,
    Package,
    Printer,
    NotebookTabs,
    Terminal
  } from '@lucide/svelte';

  export let service: {
    name: string;
    description: string;
    type: string;
    status?: string;
    url?: string;
  };

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

  $: Icon = icons[service.name] || Server;
</script>

<article
  class="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
>
  <div>
    <div class="mb-5 grid size-12 place-items-center rounded-2xl bg-orange-50 text-orange-600">
      <svelte:component this={Icon} size={22} />
    </div>

    <div class="flex items-center justify-between gap-2">
      <h3 class="text-lg font-bold text-slate-900">{service.name}</h3>
      {#if service.status}
        <span
          class="size-2.5 rounded-full {service.status === 'พร้อมใช้งาน'
            ? 'bg-emerald-500'
            : service.status === 'กำลังพัฒนา'
              ? 'bg-amber-500'
              : 'bg-rose-500'}"
          title={service.status}
        ></span>
      {/if}
    </div>

    <p class="mt-3 min-h-12 text-sm leading-relaxed text-slate-500 font-normal">
      {service.description}
    </p>
  </div>

  <div class="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
    <span class="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
      {service.type}
    </span>

    {#if service.url}
      <a
        href={service.url}
        target="_blank"
        rel="noreferrer"
        class="inline-flex items-center gap-1 font-semibold text-orange-600 transition hover:text-orange-700 hover:underline"
      >
        <span>เปิดระบบ</span>
        <ArrowRight size={15} />
      </a>
    {:else}
      <button class="inline-flex items-center gap-1 font-semibold text-slate-400">
        <span>ไม่มีลิงก์</span>
      </button>
    {/if}
  </div>
</article>

<script lang="ts">
  import { onMount } from "svelte";
  import { Search, Layers, Users, ShieldCheck } from "@lucide/svelte";
  import ServiceCard from "$lib/components/ServiceCard.svelte";

  let services = $state<any[]>([]);
  let loading = $state(true);
  let query = $state("");
  let filter = $state("ทั้งหมด");

  onMount(async () => {
    try {
      const response = await fetch('/api/services');
      if (response.ok) services = await response.json();
    } catch {
      // keep fallback
    } finally {
      loading = false;
    }
  });

  const categories = ["ทั้งหมด", "Web app", "Backend", "Mobile", "Infrastructure"];

  let shown = $derived(
    services.filter(
      (service) =>
        (filter === "ทั้งหมด" || service.type === filter) &&
        `${service.name} ${service.description}`.toLowerCase().includes(query.toLowerCase()),
    )
  );
</script>

<svelte:head>
  <title>CS-KMITL Hub · ระบบบริการภาควิชา</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased">
  <!-- Top Navigation Header -->
  <header class="border-b border-slate-200/80 bg-white">
    <div class="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
      <div class="flex items-center gap-3">
        <span class="grid size-8 place-items-center rounded-lg bg-slate-900 font-mono text-xs font-semibold text-white">
          CS
        </span>
        <div class="flex flex-col">
          <span class="text-sm font-semibold tracking-tight text-slate-900">CS-KMITL Hub</span>
          <span class="text-[10px] font-mono text-slate-400">portal.cskmitl.com</span>
        </div>
      </div>

      <nav class="flex items-center gap-2 text-xs">
        <a
          href="/passion-group"
          class="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          <Users size={14} strokeWidth={1.5} />
          <span>กลุ่มกิจกรรม (Passion Group)</span>
        </a>
        <a
          href="/admin"
          class="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          <ShieldCheck size={14} strokeWidth={1.5} />
          <span>จัดการระบบ</span>
        </a>
      </nav>
    </div>
  </header>

  <!-- Main Content -->
  <main class="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
    <!-- Breadcrumb & Context Header -->
    <div class="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p class="font-mono text-xs text-orange-700">ภาควิชาวิทยาการคอมพิวเตอร์ · สจล.</p>
        <h1 class="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          สารบบบริการดิจิทัลและโครงสร้างพื้นฐาน
        </h1>
        <p class="mt-1 text-xs text-slate-500">
          ศูนย์กลางการเข้าถึงบริการ เว็บแอปพลิเคชัน และระบบคอมพิวเตอร์สำหรับนักศึกษาและคณาจารย์
        </p>
      </div>

      <div class="flex items-center gap-2 text-xs font-mono text-slate-500">
        <span class="size-2 rounded-full bg-emerald-500"></span>
        <span>{services.length} บริการในสารบบ</span>
      </div>
    </div>

    <!-- Filter & Search Toolbar -->
    <div class="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
      <!-- Search Input -->
      <div class="relative flex-1">
        <Search
          size={15}
          strokeWidth={1.5}
          class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="search"
          bind:value={query}
          placeholder="ค้นหาชื่อบริการ คำอธิบาย หรือประเภท…"
          class="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none"
        />
      </div>

      <!-- Category Filter Pills -->
      <div class="flex flex-wrap items-center gap-1.5">
        {#each categories as item}
          <button
            type="button"
            onclick={() => (filter = item)}
            class="h-9 rounded-lg px-3 text-xs font-medium transition-colors {filter === item
              ? 'bg-slate-900 text-white'
              : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'}"
          >
            {item}
          </button>
        {/each}
      </div>
    </div>

    <!-- Services Grid -->
    <section aria-label="รายการบริการ">
      {#if loading}
        <div class="rounded-xl border border-dashed border-slate-200 p-12 text-center text-xs text-slate-500">
          กำลังเชื่อมต่อและโหลดข้อมูลบริการ…
        </div>
      {:else if shown.length === 0}
        <div class="rounded-xl border border-dashed border-slate-200 p-12 text-center text-xs text-slate-500">
          ไม่พบบริการที่ตรงกับเงื่อนไขการค้นหา
        </div>
      {:else}
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {#each shown as service (service.id || service.name)}
            <ServiceCard {service} />
          {/each}
        </div>
      {/if}
    </section>
  </main>

  <!-- Quiet Footer -->
  <footer class="border-t border-slate-200/80 bg-white px-6 py-4">
    <div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 text-xs text-slate-500 sm:flex-row">
      <p>© {new Date().getFullYear()} ภาควิชาวิทยาการคอมพิวเตอร์ คณะวิทยาศาสตร์ สจล.</p>
      <p class="font-mono text-[11px] text-slate-400">CS-KMITL Operational Hub</p>
    </div>
  </footer>
</div>

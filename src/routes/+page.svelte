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

<div class="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--text)] antialiased">
  <!-- Top Navigation Header -->
  <header class="border-b border-[var(--border)] bg-[var(--surface)]">
    <div class="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
      <div class="flex items-center gap-3">
        <span class="grid size-8 place-items-center rounded-lg bg-[var(--text)] font-mono text-xs font-medium text-[var(--bg)]">
          CS
        </span>
        <div class="flex flex-col">
          <span class="text-sm font-medium tracking-tight text-[var(--text)]">CS-KMITL Hub</span>
          <span class="text-[11px] font-mono text-[var(--text-muted)]">portal.cskmitl.com</span>
        </div>
      </div>

      <nav class="flex items-center gap-2 text-xs">
        <a
          href="/passion-group"
          class="inline-flex h-8 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--raised)] hover:text-[var(--text)]"
        >
          <Users size={15} strokeWidth={1.5} />
          <span>กลุ่มกิจกรรม</span>
        </a>
        <a
          href="/admin"
          class="inline-flex h-8 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--raised)] hover:text-[var(--text)]"
        >
          <ShieldCheck size={15} strokeWidth={1.5} />
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
        <p class="font-mono text-xs text-[var(--accent-ink)]">ภาควิชาวิทยาการคอมพิวเตอร์ · สจล.</p>
        <h1 class="mt-1 text-2xl font-medium tracking-tight text-[var(--text)]">
          สารบบบริการดิจิทัลและโครงสร้างพื้นฐาน
        </h1>
        <p class="mt-1 text-sm text-[var(--text-secondary)]">
          ศูนย์กลางการเข้าถึงบริการ เว็บแอปพลิเคชัน และระบบคอมพิวเตอร์สำหรับนักศึกษาและคณาจารย์
        </p>
      </div>

      <div class="flex items-center gap-2 text-xs font-mono tabular-nums text-[var(--text-muted)]">
        <span class="size-2 rounded-full bg-[var(--positive)]"></span>
        <span>{services.length} บริการในสารบบ</span>
      </div>
    </div>

    <!-- Filter & Search Toolbar -->
    <div class="mb-6 flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 sm:flex-row sm:items-center sm:justify-between">
      <!-- Search Input -->
      <div class="relative flex-1">
        <Search
          size={16}
          strokeWidth={1.5}
          class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
        />
        <input
          type="search"
          bind:value={query}
          placeholder="ค้นหาบริการ"
          class="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--raised)] pl-9 pr-3 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:bg-[var(--surface)] focus:outline-none"
        />
      </div>

      <!-- Category Filter Pills -->
      <div class="flex flex-wrap items-center gap-1.5">
        {#each categories as item}
          <button
            type="button"
            onclick={() => (filter = item)}
            class="h-9 rounded-lg px-3 text-xs font-medium transition-colors {filter === item
              ? 'bg-[var(--text)] text-[var(--bg)]'
              : 'border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--raised)] hover:text-[var(--text)]'}"
          >
            {item}
          </button>
        {/each}
      </div>
    </div>

    <!-- Services Grid -->
    <section aria-label="รายการบริการ">
      {#if loading}
        <div class="rounded-xl border border-dashed border-[var(--border)] p-12 text-center text-xs text-[var(--text-muted)]">
          กำลังโหลดรายการบริการ
        </div>
      {:else if shown.length === 0}
        <div class="rounded-xl border border-dashed border-[var(--border)] p-12 text-center text-xs text-[var(--text-muted)]">
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
  <footer class="border-t border-[var(--border)] bg-[var(--surface)] px-6 py-4">
    <div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 text-xs text-[var(--text-muted)] sm:flex-row">
      <p>© {new Date().getFullYear()} ภาควิชาวิทยาการคอมพิวเตอร์ คณะวิทยาศาสตร์ สจล.</p>
      <p class="font-mono text-[11px] text-[var(--text-muted)]">CS-KMITL Operational Hub</p>
    </div>
  </footer>
</div>

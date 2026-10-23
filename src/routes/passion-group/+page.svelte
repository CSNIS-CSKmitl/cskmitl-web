<script lang="ts">
  import { onMount } from 'svelte';
  import { Search, ArrowLeft, ArrowUpRight, Users, Loader2 } from '@lucide/svelte';

  let groups: any[] = [];
  let loading = true;
  let searchQuery = '';

  const excludedGroups = new Set(['7uhcfkj5an632r8', '000000000000006']);

  onMount(async () => {
    try {
      const response = await fetch('/api/passion-group');
      if (response.ok) {
        const data = await response.json();
        groups = data.filter((group: any) => !excludedGroups.has(group.id));
      }
    } catch {
      // ignore
    } finally {
      loading = false;
    }
  });

  $: filteredGroups = groups.filter((group) => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return true;
    const name = (group.name || group.title || '').toLowerCase();
    const desc = (group.description || group.detail || '').toLowerCase();
    const owner = (group.owner_name || '').toLowerCase();
    return name.includes(term) || desc.includes(term) || owner.includes(term);
  });
</script>

<svelte:head>
  <title>Passion Groups — CS-KMITL Hub</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900 antialiased">
  <!-- Header -->
  <header class="border-b border-slate-200 bg-white">
    <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
      <a href="/" class="flex items-center gap-2.5 font-bold transition hover:opacity-90">
        <span class="grid size-9 place-items-center rounded-xl bg-orange-500 text-sm font-bold text-white shadow-sm">
          CS
        </span>
        <span class="text-base font-bold text-slate-900">CS-KMITL Hub</span>
      </a>

      <div class="flex items-center gap-2 text-sm">
        <a
          href="/"
          class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft size={14} />
          กลับหน้าหลัก Hub
        </a>
        <a
          href="/admin"
          class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 transition hover:border-orange-500 hover:text-orange-600"
        >
          Admin
        </a>
      </div>
    </div>
  </header>

  <!-- Hero Section (Clean & Official, No AI elements) -->
  <main class="flex-1">
    <section class="border-b border-slate-200 bg-white py-10 sm:py-12">
      <div class="mx-auto max-w-6xl px-6">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="text-xs font-bold uppercase tracking-wider text-orange-600">Community</p>
            <h1 class="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Passion Group
            </h1>
            <p class="mt-2 max-w-xl text-sm leading-relaxed text-slate-500">
              กลุ่มความสนใจและพื้นที่รวมตัวของคนใน CS-KMITL
            </p>
          </div>

          <div class="flex items-center gap-3">
            <span class="text-sm font-medium text-slate-500">
              ทั้งหมด {groups.length} กลุ่ม
            </span>
            <a
              href="/admin?tab=passion-group"
              class="inline-flex items-center rounded-lg bg-orange-500 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-orange-600"
            >
              + เพิ่ม Passion Group
            </a>
          </div>
        </div>

        <!-- Search Bar -->
        <div class="mt-6 flex items-center">
          <div class="relative w-full max-w-md">
            <Search class="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              bind:value={searchQuery}
              type="text"
              placeholder="ค้นหากลุ่มความสนใจ หรือผู้ดูแล..."
              class="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder:text-slate-400 shadow-sm transition focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
          {#if searchQuery}
            <button
              onclick={() => (searchQuery = '')}
              class="ml-3 text-xs font-semibold text-slate-500 hover:text-orange-600"
            >
              ล้างคำค้น
            </button>
          {/if}
        </div>
      </div>
    </section>

    <!-- Groups Content -->
    <section class="mx-auto max-w-6xl px-6 py-10">
      {#if loading}
        <div class="flex min-h-[250px] flex-col items-center justify-center">
          <Loader2 class="size-6 animate-spin text-orange-500" />
          <p class="mt-3 text-xs text-slate-500">กำลังโหลด...</p>
        </div>
      {:else if filteredGroups.length === 0}
        <div class="rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center">
          <div class="mx-auto mb-3 grid size-10 place-items-center rounded-xl bg-slate-100 text-slate-500">
            <Users size={20} />
          </div>
          <h2 class="text-base font-bold text-slate-800">
            {searchQuery ? 'ไม่พบกลุ่มที่ตรงกับคำค้นหา' : 'ยังไม่มีข้อมูล Passion Group'}
          </h2>
          <p class="mt-1 text-xs text-slate-500">
            {searchQuery ? 'ลองค้นหาด้วยคำอื่น' : 'สามารถเพิ่มกลุ่มความสนใจได้จากหน้า Admin'}
          </p>
        </div>
      {:else}
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {#each filteredGroups as group (group.id)}
            <article class="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
              <div>
                <div class="flex items-start justify-between gap-2">
                  <h2 class="text-base font-bold text-slate-900">
                    {group.name || group.title || 'Passion Group'}
                  </h2>
                </div>

                {#if group.owner_name}
                  <p class="mt-1 text-xs text-slate-400">
                    ผู้ดูแล: <span class="font-medium text-slate-600">{group.owner_name}</span>
                  </p>
                {/if}

                <p class="mt-3 text-xs leading-relaxed text-slate-500 line-clamp-3 font-normal">
                  {group.description || group.detail || 'กลุ่มความสนใจของชาว CS-KMITL'}
                </p>
              </div>

              <div class="mt-5 border-t border-slate-100 pt-3">
                {#if group.link || group.url}
                  <a
                    href={group.link || group.url}
                    target="_blank"
                    rel="noreferrer"
                    class="inline-flex w-full items-center justify-center gap-1 rounded-lg bg-orange-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-orange-600"
                  >
                    <span>ดูรายละเอียด / เข้ากลุ่ม</span>
                    <ArrowUpRight size={13} />
                  </a>
                {:else}
                  <div class="flex items-center justify-between text-xs text-slate-400">
                    <span>ไม่มีลิงก์</span>
                  </div>
                {/if}
              </div>
            </article>
          {/each}
        </div>
      {/if}
    </section>
  </main>

  <!-- Footer -->
  <footer class="border-t border-slate-200 bg-white px-6 py-4 text-center text-xs text-slate-500">
    © {new Date().getFullYear()} · ผู้จัดทำ <a href="https://github.com/techasit5415" target="_blank" rel="noopener noreferrer" class="font-semibold text-slate-700 hover:text-orange-600 hover:underline">Techasit Vanitpattarakul</a>
  </footer>
</div>

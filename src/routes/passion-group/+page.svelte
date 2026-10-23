<script lang="ts">
  import { onMount } from 'svelte';
  import { Search, ArrowLeft, ArrowUpRight, Users, Sparkles, Loader2 } from '@lucide/svelte';

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
      // handle error gracefully
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
  <meta name="description" content="กลุ่มความสนใจและพื้นที่รวมตัวของคนใน CS-KMITL" />
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

  <!-- Hero Section -->
  <main class="flex-1">
    <section class="border-b border-slate-200/80 bg-white py-12 sm:py-16">
      <div class="mx-auto max-w-6xl px-6">
        <div class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div class="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
              <Sparkles size={13} />
              <span>Community & Collaboration</span>
            </div>
            <h1 class="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Passion <span class="text-orange-600">Group</span>
            </h1>
            <p class="mt-3 max-w-xl text-sm leading-relaxed text-slate-500 sm:text-base">
              กลุ่มความสนใจและพื้นที่รวมตัวของคนใน CS-KMITL แลกเปลี่ยนความรู้ ทำโปรเจกต์ และร่วมกิจกรรมไปด้วยกัน
            </p>
          </div>

          <!-- Quick Stats / Action -->
          <div class="flex items-center gap-3">
            <div class="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-right">
              <span class="text-xs font-medium text-slate-500">กลุ่มทั้งหมด</span>
              <p class="text-2xl font-extrabold text-slate-900">
                {groups.length} <span class="text-xs font-normal text-slate-400">กลุ่ม</span>
              </p>
            </div>
            <a
              href="/admin?tab=passion-group"
              class="inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-orange-600 active:scale-95"
            >
              + เสนอกลุ่มใหม่
            </a>
          </div>
        </div>

        <!-- Search Bar -->
        <div class="mt-8 flex items-center">
          <div class="relative w-full max-w-md">
            <Search class="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              bind:value={searchQuery}
              type="text"
              placeholder="ค้นหากลุ่มความสนใจ, ผู้ดูแล, กิจกรรม..."
              class="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder:text-slate-400 shadow-sm transition focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
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
    <section class="mx-auto max-w-6xl px-6 py-12">
      {#if loading}
        <div class="flex min-h-[300px] flex-col items-center justify-center">
          <Loader2 class="size-6 animate-spin text-orange-500" />
          <p class="mt-3 text-xs text-slate-500">กำลังโหลดรายการ Passion Group...</p>
        </div>
      {:else if filteredGroups.length === 0}
        <div class="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <div class="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-orange-50 text-orange-500">
            <Users size={24} />
          </div>
          <h3 class="text-base font-bold text-slate-800">
            {searchQuery ? 'ไม่พบกลุ่มที่ตรงกับคำค้นหา' : 'ยังไม่มีข้อมูล Passion Group'}
          </h3>
          <p class="mt-1 text-xs text-slate-500">
            {searchQuery
              ? 'ลองค้นหาด้วยคำอื่น หรือคลิก "ล้างคำค้น"'
              : 'สามารถเพิ่มกลุ่มความสนใจได้จากหน้า Admin'}
          </p>
          {#if searchQuery}
            <button
              onclick={() => (searchQuery = '')}
              class="mt-4 text-xs font-semibold text-orange-600 hover:underline"
            >
              แสดงกลุ่มทั้งหมด
            </button>
          {:else}
            <a
              href="/admin?tab=passion-group"
              class="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-orange-600"
            >
              + เพิ่ม Passion Group ใน Admin
            </a>
          {/if}
        </div>
      {:else}
        <div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {#each filteredGroups as group (group.id)}
            <article class="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
              <div>
                <div class="flex items-start gap-3">
                  <div class="grid size-10 shrink-0 place-items-center rounded-xl bg-orange-50 text-sm font-bold text-orange-600">
                    {(group.name || group.title || 'PG').slice(0, 2).toUpperCase()}
                  </div>
                  <div class="flex-1 min-w-0">
                    <h2 class="text-base font-bold text-slate-900 truncate">
                      {group.name || group.title || 'Passion Group'}
                    </h2>
                    {#if group.owner_name}
                      <p class="mt-0.5 text-xs text-slate-400">
                        ผู้ดูแล: <span class="font-medium text-slate-600">{group.owner_name}</span>
                      </p>
                    {/if}
                  </div>
                </div>

                <p class="mt-4 text-xs leading-relaxed text-slate-500 line-clamp-3">
                  {group.description || group.detail || 'กลุ่มความสนใจของชาว CS-KMITL'}
                </p>
              </div>

              <div class="mt-6 border-t border-slate-100 pt-4">
                {#if group.link || group.url}
                  <a
                    href={group.link || group.url}
                    target="_blank"
                    rel="noreferrer"
                    class="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-orange-600"
                  >
                    <span>ดูรายละเอียด / เข้ากลุ่ม</span>
                    <ArrowUpRight size={14} />
                  </a>
                {:else}
                  <div class="flex items-center justify-between text-xs text-slate-400">
                    <span>ไม่มีลิงก์ภายนอก</span>
                    <span class="rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">คอมมูนิตี้</span>
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

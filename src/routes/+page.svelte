<script lang="ts">
  import { onMount } from "svelte";
  import { Search } from "@lucide/svelte";
  import ServiceCard from "$lib/components/ServiceCard.svelte";
  let services: any[] = [];
  let loading = true;
  let query = "";
  let filter = "ทั้งหมด";
  onMount(async () => { const response = await fetch('/api/services'); if (response.ok) services = await response.json(); loading = false; });
  $: shown = services.filter(
    (service) =>
      (filter === "ทั้งหมด" || service.type === filter) &&
      `${service.name} ${service.description}`.toLowerCase().includes(query.toLowerCase()),
  );
</script>

<svelte:head><title>CS-KMITL Hub</title></svelte:head>
<div class="flex min-h-screen flex-col">
<header class="border-b bg-white">
  <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
    <div class="flex items-center gap-2 font-bold">
      <span
        class="grid size-9 place-items-center rounded-xl bg-orange-500 text-white"
        >CS</span
      > CS-KMITL Hub
    </div>
    <div class="flex items-center gap-2"><a href="#services" class="hidden rounded-lg border px-3 py-2 text-sm sm:inline-flex">Services</a><a href="/passion-group" class="rounded-lg border px-3 py-2 text-sm">Passion Group</a><a href="/admin" class="rounded-lg border px-3 py-2 text-sm">Admin</a></div>
  </div>
</header>
<main class="flex-1 mx-auto w-full max-w-6xl px-6 pb-16">
  <section class="py-16 text-center">
    <!-- <p class="mb-4 text-sm font-bold uppercase tracking-wider text-orange-600">Computer Science · KMITL</p> -->
    <h1 class="text-4xl font-bold tracking-tight md:text-6xl">CS-KMITL <br /><span class="text-orange-600">Hub</span></h1>
    <!-- <p class="mx-auto mt-5 max-w-xl text-lg text-slate-500">ค้นหาระบบที่ต้องใช้ หรือกลุ่มที่อยากเข้าร่วม</p> -->
    <div class="mt-8 flex flex-wrap justify-center gap-3"><a href="#services" class="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white shadow-sm hover:bg-orange-600">เข้า Services →</a><a href="/passion-group" class="rounded-xl border bg-white px-5 py-3 font-semibold hover:border-orange-500">หา Passion Group →</a></div>



  </section>
  <section id="services" class="mt-16">
    <div class="mb-6 flex items-end justify-between">
      <div>

      </div>

    </div>
    <div class="mb-6 flex flex-wrap gap-2">
      {#each ["ทั้งหมด", "Web app", "Backend", "Mobile", "Infrastructure"] as item}<button
          onclick={() => (filter = item)}
          class:active={filter === item}
          class="rounded-full border px-4 py-2 text-sm transition hover:border-orange-500"
          >{item}</button
        >{/each}
    </div>
    <div class="grid justify-center gap-4 md:grid-cols-2 lg:grid-cols-3">
      {#if loading}<p class="col-span-full py-12 text-center text-slate-500">กำลังโหลดระบบ...</p>{:else if shown.length === 0}<p class="col-span-full py-12 text-center text-slate-500">ยังไม่มีข้อมูลบริการใน PocketBase</p>{:else}{#each shown as service}<ServiceCard {service} />{/each}{/if}
    </div>
  </section>
</main>
<footer class="border-t bg-white px-6 py-4 text-center text-xs text-slate-500">© {new Date().getFullYear()} · ผู้จัดทำ <a href="https://github.com/techasit5415" target="_blank" rel="noopener noreferrer" class="font-semibold text-slate-700 hover:text-orange-600 hover:underline">Techasit Vanitpattarakul</a></footer>
</div>

<style>
  .active {
    background: #f97316;
    color: white;
    border-color: #f97316;
  }
</style>

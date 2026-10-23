<script lang="ts">
  import { onMount } from 'svelte';
  import {
    Plus,
    Trash2,
    Pencil,
    ArrowLeft,
    X,
    Search,
    Loader2,
    ArrowUpRight
  } from '@lucide/svelte';

  let name = '';
  let description = '';
  let url = '';
  let owner_name = '';
  let editingId: string | null = null;

  let groups: any[] = [];
  let loading = true;
  let submitting = false;
  let searchTerm = '';

  let notification: { type: 'success' | 'error'; text: string } | null = null;
  let timer: any = null;

  function notify(type: 'success' | 'error', text: string) {
    if (timer) clearTimeout(timer);
    notification = { type, text };
    timer = setTimeout(() => {
      notification = null;
    }, 4000);
  }

  onMount(async () => {
    await fetchGroups();
  });

  async function fetchGroups() {
    loading = true;
    try {
      const response = await fetch('/api/passion-group');
      if (response.ok) {
        groups = await response.json();
      } else {
        notify('error', 'ไม่สามารถดึงข้อมูลกลุ่มได้');
      }
    } catch {
      notify('error', 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      loading = false;
    }
  }

  function startEdit(group: any) {
    editingId = group.id;
    name = group.name || group.title || '';
    description = group.description || group.detail || '';
    url = group.url || group.link || '';
    owner_name = group.owner_name || '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    editingId = null;
    name = '';
    description = '';
    url = '';
    owner_name = '';
  }

  async function saveGroup() {
    if (!name.trim()) {
      notify('error', 'กรุณาระบุชื่อกลุ่ม');
      return;
    }
    submitting = true;
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        url: url.trim(),
        owner_name: owner_name.trim()
      };
      const isEdit = Boolean(editingId);
      const response = await fetch('/api/passion-group', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(isEdit ? { id: editingId, ...payload } : payload)
      });

      if (response.ok) {
        notify('success', isEdit ? `แก้ไขกลุ่ม "${name}" เรียบร้อยแล้ว` : `เพิ่มกลุ่ม "${name}" สำเร็จ`);
        cancelEdit();
        await fetchGroups();
      } else {
        const data = await response.json().catch(() => ({}));
        notify('error', data.error || 'บันทึกไม่สำเร็จ กรุณาลองใหม่');
      }
    } catch {
      notify('error', 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      submitting = false;
    }
  }

  async function deleteGroup(id: string, groupName: string) {
    if (!confirm(`คุณต้องการลบ Passion Group "${groupName}" ใช่หรือไม่?`)) return;
    try {
      const res = await fetch('/api/passion-group', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        notify('success', `ลบกลุ่ม "${groupName}" สำเร็จ`);
        groups = groups.filter((g) => g.id !== id);
      } else {
        notify('error', 'ลบไม่สำเร็จ หรือไม่มีสิทธิ์ admin');
      }
    } catch {
      notify('error', 'เกิดข้อผิดพลาดในการลบข้อมูล');
    }
  }

  $: filteredGroups = groups.filter((g) => {
    const q = searchTerm.toLowerCase();
    const gName = (g.name || g.title || '').toLowerCase();
    const gDesc = (g.description || g.detail || '').toLowerCase();
    const gOwner = (g.owner_name || '').toLowerCase();
    return gName.includes(q) || gDesc.includes(q) || gOwner.includes(q);
  });
</script>

<svelte:head>
  <title>จัดการ Passion Group — CS-KMITL Hub</title>
</svelte:head>

<div class="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
  <!-- Minimalist Notification -->
  {#if notification}
    <aside
      aria-label="Notification"
      class="fixed bottom-6 right-6 z-50 flex max-w-sm items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-md {notification.type ===
      'success'
        ? 'border-slate-200 text-slate-800'
        : 'border-rose-200 text-rose-900'}"
    >
      <span
        class="size-2 rounded-full {notification.type === 'success'
          ? 'bg-orange-500'
          : 'bg-rose-600'}"
      ></span>
      <p class="flex-1 text-xs font-medium">{notification.text}</p>
      <button
        onclick={() => (notification = null)}
        class="text-slate-400 hover:text-slate-700"
        aria-label="ปิดการแจ้งเตือน"
      >
        <X size={14} />
      </button>
    </aside>
  {/if}

  <!-- Header -->
  <header class="border-b border-slate-200 bg-white">
    <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
      <div class="flex items-center gap-3">
        <a href="/admin" class="flex items-center gap-2 text-sm font-semibold text-orange-600 transition hover:text-orange-700">
          <ArrowLeft size={16} />
          กลับหน้าหลัก Admin
        </a>
      </div>

      <nav class="flex items-center gap-3 text-sm">
        <a
          href="/passion-group"
          target="_blank"
          class="inline-flex items-center gap-1 font-semibold text-orange-600 transition hover:underline"
        >
          ดูหน้า Passion Group ชุมชน
          <ArrowUpRight size={14} />
        </a>
      </nav>
    </div>
  </header>

  <main class="mx-auto max-w-6xl px-6 py-10">
    <div class="mb-8 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          จัดการ Passion Group
        </h1>
        <p class="mt-1 text-sm text-slate-500">
          เพิ่มกลุ่มความสนใจใหม่ และจัดการรายการกลุ่มทั้งหมด
        </p>
      </div>

      <a
        href="/admin"
        class="text-sm font-semibold text-orange-600 hover:underline"
      >
        ไปยังหน้า Admin รวม →
      </a>
    </div>

    <div class="grid gap-6 lg:grid-cols-[380px_1fr]">
      <!-- Left: Simple Form to Add or Edit Group -->
      <section class="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 class="text-base font-bold text-slate-900">
            {editingId ? 'แก้ไขกลุ่ม' : 'เพิ่มกลุ่มใหม่'}
          </h2>
          {#if editingId}
            <button
              type="button"
              onclick={cancelEdit}
              class="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              ยกเลิก
            </button>
          {/if}
        </div>

        <form
          onsubmit={(event) => {
            event.preventDefault();
            saveGroup();
          }}
          class="mt-4 space-y-3.5"
        >
          <div>
            <label for="group-name-input" class="block text-xs font-semibold text-slate-700">
              ชื่อกลุ่ม <span class="text-orange-600">*</span>
            </label>
            <input
              id="group-name-input"
              bind:value={name}
              placeholder="เช่น Cyber Security Club"
              required
              class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div>
            <label for="group-owner-input" class="block text-xs font-semibold text-slate-700">ผู้ดูแล / ผู้ประสานงาน</label>
            <input
              id="group-owner-input"
              bind:value={owner_name}
              placeholder="เช่น Techasit"
              class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div>
            <label for="group-url-input" class="block text-xs font-semibold text-slate-700">ลิงก์กลุ่ม (Discord, LINE, FB, Web)</label>
            <input
              id="group-url-input"
              bind:value={url}
              type="url"
              placeholder="https://..."
              class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div>
            <label for="group-desc-input" class="block text-xs font-semibold text-slate-700">รายละเอียด</label>
            <textarea
              id="group-desc-input"
              bind:value={description}
              rows={4}
              placeholder="รายละเอียดกิจกรรม หรือกลุ่มเป้าหมาย..."
              class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            ></textarea>
          </div>

          <div class="flex gap-2">
            {#if editingId}
              <button
                type="button"
                onclick={cancelEdit}
                class="w-1/3 rounded-lg border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                ยกเลิก
              </button>
            {/if}
            <button
              type="submit"
              disabled={submitting}
              class="flex-1 rounded-lg bg-orange-500 py-2.5 text-xs font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
            >
              {#if submitting}
                กำลังบันทึก...
              {:else if editingId}
                บันทึกการแก้ไข
              {:else}
                เพิ่ม Passion Group
              {/if}
            </button>
          </div>
        </form>
      </section>

      <!-- Right: Existing Passion Groups List -->
      <section>
        <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="relative w-full max-w-xs">
            <Search class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              bind:value={searchTerm}
              type="text"
              placeholder="ค้นหากลุ่ม..."
              class="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <span class="text-xs font-semibold text-slate-400">
            {groups.length} กลุ่ม
          </span>
        </div>

        {#if loading}
          <div class="flex min-h-[250px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <Loader2 class="size-5 animate-spin text-orange-500" />
          </div>
        {:else if filteredGroups.length === 0}
          <div class="rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center">
            <p class="text-sm text-slate-500">
              {searchTerm ? 'ไม่พบข้อมูลที่ตรงกับคำค้นหา' : 'ยังไม่มี Passion Group ในระบบ'}
            </p>
          </div>
        {:else}
          <div class="grid gap-4 sm:grid-cols-2">
            {#each filteredGroups as group (group.id)}
              <div class="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300">
                <div>
                  <div class="flex items-start justify-between gap-2">
                    <div>
                      <h3 class="font-bold text-slate-900">
                        {group.name || group.title || 'Passion Group'}
                      </h3>
                      {#if group.owner_name}
                        <p class="mt-0.5 text-xs text-slate-500">
                          ผู้ดูแล: <span class="font-medium text-slate-700">{group.owner_name}</span>
                        </p>
                      {/if}
                    </div>

                    <div class="flex items-center gap-1">
                      <button
                        onclick={() => startEdit(group)}
                        title="แก้ไขกลุ่มนี้"
                        class="p-1 text-slate-400 transition hover:text-orange-600"
                        aria-label="แก้ไขกลุ่มนี้"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onclick={() => deleteGroup(group.id, group.name || group.title || 'กลุ่มนี้')}
                        title="ลบกลุ่มนี้"
                        class="p-1 text-slate-400 transition hover:text-rose-600"
                        aria-label="ลบกลุ่มนี้"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <p class="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-500">
                    {group.description || group.detail || 'ไม่มีรายละเอียด'}
                  </p>
                </div>

                <div class="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                  {#if group.url || group.link}
                    <a
                      href={group.url || group.link}
                      target="_blank"
                      rel="noreferrer"
                      class="inline-flex items-center gap-1 font-semibold text-orange-600 hover:underline"
                    >
                      เข้ากลุ่ม
                      <ArrowUpRight size={13} />
                    </a>
                  {:else}
                    <span class="text-slate-400">ไม่มีลิงก์</span>
                  {/if}

                  <span class="font-mono text-[10px] text-slate-300">
                    {group.id ? group.id.slice(0, 6) : ''}
                  </span>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </section>
    </div>
  </main>
</div>

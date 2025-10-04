<script lang="ts">
  /**
   * The main title for the authentication page.
   * @type {string}
   */
  export let title: string;

  /**
   * The subtitle or instruction for the user.
   * @type {string}
   */
  export let subtitle: string;
</script>

<div class="text-center mb-8">
  <h1 class="text-3xl font-bold text-white">{title}</h1>
  <p class="text-lg text-gray-400 mt-2">{subtitle}</p>
</div>
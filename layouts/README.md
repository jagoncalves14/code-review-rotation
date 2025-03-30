## Layouts

Vue components in this dir are used as layouts.

By default, `default.vue` will be used unless an alternative is specified in the route meta.

```vue
<script setup lang="ts">
definePageMeta({
	layout: 'default',
})
</script>
```

Learn more on https://nuxt.com/docs/guide/directory-structure/layouts

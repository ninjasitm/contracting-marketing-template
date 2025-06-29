<script lang="ts" setup>
import type { BasePageState } from '~/types/types';

interface WorkPageState extends BasePageState {
    featuredClient?: {
        client: string;
        type?: string;
        description?: string;
        heroImage?: string;
    };
    footer?: {
        title: string;
        description: string;
    };
}

// ... existing component code ...
</script>
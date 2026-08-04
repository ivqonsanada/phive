<?php

namespace Tests\Feature\Settings;

use App\Models\Project;
use App\Models\User;
use App\Support\StoredFile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class MediaTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake(StoredFile::DISK);
    }

    #[Test]
    public function a_user_can_upload_and_remove_an_avatar(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('t')->plainTextToken;

        $this->withToken($token)
            ->postJson('/api/settings/avatar', ['file' => UploadedFile::fake()->image('me.jpg')])
            ->assertOk()
            ->assertJsonPath('user.photo_url', fn (?string $url) => is_string($url));

        $path = $user->fresh()->photo_url;
        Storage::disk(StoredFile::DISK)->assertExists($path);

        $this->forgetAuthState()->withToken($token)
            ->deleteJson('/api/settings/avatar')
            ->assertOk();

        Storage::disk(StoredFile::DISK)->assertMissing($path);
        $this->assertNull($user->fresh()->photo_url);
    }

    #[Test]
    public function replacing_an_avatar_deletes_the_old_file(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('t')->plainTextToken;

        $this->withToken($token)
            ->postJson('/api/settings/avatar', ['file' => UploadedFile::fake()->image('first.jpg')]);
        $first = $user->fresh()->photo_url;

        $this->forgetAuthState()->withToken($token)
            ->postJson('/api/settings/avatar', ['file' => UploadedFile::fake()->image('second.jpg')]);
        $second = $user->fresh()->photo_url;

        $this->assertNotSame($first, $second);
        Storage::disk(StoredFile::DISK)->assertMissing($first);
        Storage::disk(StoredFile::DISK)->assertExists($second);
    }

    #[Test]
    public function an_avatar_must_be_an_image(): void
    {
        $user = User::factory()->create();

        $this->withToken($user->createToken('t')->plainTextToken)
            ->postJson('/api/settings/avatar', ['file' => UploadedFile::fake()->create('virus.exe', 10)])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('file');
    }

    #[Test]
    public function an_oversized_avatar_is_rejected(): void
    {
        config()->set('phive.uploads.avatar_max_kb', 100);
        $user = User::factory()->create();

        $this->withToken($user->createToken('t')->plainTextToken)
            ->postJson('/api/settings/avatar', [
                'file' => UploadedFile::fake()->image('huge.jpg')->size(500),
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('file');
    }

    #[Test]
    public function a_cv_must_be_a_pdf(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('t')->plainTextToken;

        $this->withToken($token)
            ->postJson('/api/settings/cv', ['file' => UploadedFile::fake()->image('cv.png')])
            ->assertUnprocessable();

        $this->forgetAuthState()->withToken($token)
            ->postJson('/api/settings/cv', ['file' => UploadedFile::fake()->create('cv.pdf', 20, 'application/pdf')])
            ->assertOk();

        Storage::disk(StoredFile::DISK)->assertExists($user->fresh()->cv_url);
    }

    #[Test]
    public function a_lecturer_can_set_a_project_thumbnail(): void
    {
        $lecturer = User::factory()->lecturer()->create();
        $project = Project::factory()->create(['user_id' => $lecturer->id]);

        $this->withToken($lecturer->createToken('t')->plainTextToken)
            ->postJson("/api/my/projects/{$project->project_url}/thumbnail", [
                'file' => UploadedFile::fake()->image('cover.jpg'),
            ])
            ->assertOk();

        Storage::disk(StoredFile::DISK)->assertExists($project->fresh()->thumbnail);
    }

    #[Test]
    public function a_lecturer_cannot_set_a_thumbnail_on_someone_elses_project(): void
    {
        $lecturer = User::factory()->lecturer()->create();
        $theirs = Project::factory()->create();

        $this->withToken($lecturer->createToken('t')->plainTextToken)
            ->postJson("/api/my/projects/{$theirs->project_url}/thumbnail", [
                'file' => UploadedFile::fake()->image('cover.jpg'),
            ])
            ->assertForbidden();
    }

    #[Test]
    public function the_api_returns_an_absolute_url_not_the_stored_path(): void
    {
        $lecturer = User::factory()->lecturer()->create();
        $project = Project::factory()->create(['user_id' => $lecturer->id]);

        $this->withToken($lecturer->createToken('t')->plainTextToken)
            ->postJson("/api/my/projects/{$project->project_url}/thumbnail", [
                'file' => UploadedFile::fake()->image('cover.jpg'),
            ])
            ->assertOk()
            ->assertJsonPath(
                'project.thumbnail',
                fn (?string $url) => is_string($url) && str_contains($url, '/storage/'),
            );

        // The column itself keeps the disk-relative path.
        $this->assertStringStartsWith('project-thumbnails/', $project->fresh()->thumbnail);
    }
}

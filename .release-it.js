const changelogCommand =
  "yarn auto-changelog " +
  "--package " +
  "--unreleased " +
  "--tag-pattern release-.+ " +
  "--tag-prefix release- " +
  "--commit-limit false " +
  "--release-summary " +
  "--template keepachangelog"

module.exports = {
  hooks: {
    "before:init": "ls -la",
    "after:bump": changelogCommand,
    "after:release": "echo Successfully released ${name} ${version} to ${repo.repository}."
  },
  git: {
    commitMessage: "chore(release): ${version}",
    tagAnnotation: "Release ${version}",
    tagName: "release-${version}",
    requireCleanWorkingDir: true,
    requireUpstream: false,
    changelog: null,
    push: true
  },
  gitlab: {
    release: true,
    tokenRef: "RELEASE_IT_TOKEN",
    releaseName: "Release ${version}",
    releaseNotes: "echo ${name}: ${version}"
  },
  npm: {
    publish: false
  }
}

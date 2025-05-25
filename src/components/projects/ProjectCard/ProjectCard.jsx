import './ProjectCard.css';

export default function ProjectCard({ project }) {
  return (
    <div className="project-card">
      <h3>{project.title}</h3>
      <p>{project.description}</p>
      <span className={`status ${project.status}`}>
        {project.status}
      </span>
    </div>
  );
}